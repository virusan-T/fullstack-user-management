import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '6a8f4594dbbd39dce22a8b27',
    description: 'Unique user ID',
  })
  _id: string;

  @ApiProperty({
    example: 'Virusan',
    description: 'User name',
  })
  name: string;

  @ApiProperty({
    example: 'viru@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: '2026-08-26T19:08:04.279Z',
    description: 'Account creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-08-26T19:08:04.279Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}