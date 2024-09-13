import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("redirect")
@Controller()
export class RedirectController {
  @Get()
  @Redirect('/api', 302)
  @ApiOperation({summary: "Página inicial"})
  root() {
    return;
  }
}