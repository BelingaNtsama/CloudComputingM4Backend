import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AnnouncesService } from './announces.service';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class AnnouncesController {
  constructor(private readonly announcesService: AnnouncesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('images')) // champ "image" dans form-data
  async create(
    @Body() createAnnounceDto: CreateAnnounceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.announcesService.create(createAnnounceDto, userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    return await this.announcesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return await this.announcesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnnounceDto: UpdateAnnounceDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.announcesService.update(+id, updateAnnounceDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.announcesService.remove(+id, userId);
  }
}
