import { IsString } from 'class-validator';

export class CompareProfilesDto {
  @IsString()
  profileIdA!: string;

  @IsString()
  profileIdB!: string;
}
