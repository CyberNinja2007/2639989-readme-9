import {Body, Controller, Get, HttpStatus, Param, Post} from '@nestjs/common';
import {AuthenticationService} from "./authentication.service";
import {CreateUserDto} from "../dto/create-user.dto";
import {LoginUserDto} from "../dto/login-user.dto";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthenticationResponseMessage} from "./authentication.constant";
import {LoggedUserRdo} from "../rdo/logged-user.rdo";
import {UserRdo} from '../rdo/user.rdo';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: AuthenticationResponseMessage.UserCreated,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: AuthenticationResponseMessage.UserExist,
  })
  @Post('register')
  public async create(@Body() dto: CreateUserDto) {
    const newUser = await this.authenticationService.register(dto);
    return newUser.toPOJO();
  }

  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: AuthenticationResponseMessage.LoggedSuccess,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AuthenticationResponseMessage.LoggedError,
  })
  @Post('login')
  public async login(@Body() dto: LoginUserDto) {
    const verifiedUser = await this.authenticationService.verifyUser(dto);
    return verifiedUser.toPOJO();
  }

  @ApiResponse({
    type: UserRdo,
    status: HttpStatus.OK,
    description: AuthenticationResponseMessage.UserFound,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: AuthenticationResponseMessage.UserNotFound,
  })
  @Get(':id')
  public async show(@Param('id') id: string) {
    const existUser = await this.authenticationService.getUser(id);
    return existUser.toPOJO();
  }
}
