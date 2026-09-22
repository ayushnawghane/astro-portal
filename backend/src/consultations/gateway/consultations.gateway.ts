import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ConsultationsService } from '../consultations.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';

interface AuthenticatedSocket extends Socket {
  data: { userId: string; role: string };
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/consultations' })
export class ConsultationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ConsultationsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly consultations: ConsultationsService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    try {
      const token = (client.handshake.auth?.token as string) ?? (client.handshake.query?.token as string);
      if (!token) throw new UnauthorizedException('Missing auth token.');
      const payload = this.jwt.verify<JwtPayload>(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
    } catch {
      client.emit('error', { message: 'Authentication failed.' });
      client.disconnect();
    }
  }

  @SubscribeMessage('joinConsultation')
  async joinConsultation(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { consultationId: string }) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: body.consultationId },
      include: { astrologer: true },
    });
    if (!consultation) {
      client.emit('error', { message: 'Consultation not found.' });
      return;
    }
    if (consultation.userId !== client.data.userId && consultation.astrologer.userId !== client.data.userId) {
      client.emit('error', { message: 'You are not a party to this consultation.' });
      return;
    }
    await client.join(body.consultationId);
    client.emit('joinedConsultation', { consultationId: body.consultationId });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { consultationId: string; content: string; attachmentUrl?: string },
  ) {
    try {
      const message = await this.consultations.addMessage(body.consultationId, client.data.userId, body.content, body.attachmentUrl);
      this.server.to(body.consultationId).emit('newMessage', message);
    } catch (err) {
      client.emit('error', { message: err instanceof Error ? err.message : 'Failed to send message.' });
    }
  }

  @SubscribeMessage('typing')
  typing(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { consultationId: string; isTyping: boolean }) {
    client.to(body.consultationId).emit('typing', { userId: client.data.userId, isTyping: body.isTyping });
  }

  // WebRTC signaling relay for voice consultations. Membership in the room
  // (joinConsultation) already restricts this to the two authorized parties,
  // so these handlers just forward the SDP/ICE payloads verbatim.

  @SubscribeMessage('voice:offer')
  voiceOffer(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { consultationId: string; sdp: unknown }) {
    client.to(body.consultationId).emit('voice:offer', { sdp: body.sdp });
  }

  @SubscribeMessage('voice:answer')
  voiceAnswer(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { consultationId: string; sdp: unknown }) {
    client.to(body.consultationId).emit('voice:answer', { sdp: body.sdp });
  }

  @SubscribeMessage('voice:ice-candidate')
  voiceIceCandidate(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { consultationId: string; candidate: unknown }) {
    client.to(body.consultationId).emit('voice:ice-candidate', { candidate: body.candidate });
  }

  @SubscribeMessage('voice:hangup')
  voiceHangup(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { consultationId: string }) {
    client.to(body.consultationId).emit('voice:hangup', {});
  }
}
