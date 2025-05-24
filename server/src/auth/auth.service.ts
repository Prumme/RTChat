import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/entities/user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const user = await this.userService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      username: user.pseudo,
      color: user.color,
    };
    return {
      token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const user = await this.userService.register(registerDto);
    const payload = { sub: user.id, username: user.pseudo, color: user.color };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
