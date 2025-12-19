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
} from '@nestjs/common';
import { AnnouncesService } from './announces.service';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('announces')
export class AnnouncesController {
  constructor(private readonly announcesService: AnnouncesService) {}

  // Création d’une annonce liée à l’utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAnnounceDto: CreateAnnounceDto, @Req() req) {
    const userId = req.user.id; // injecté par JwtStrategy
    return await this.announcesService.create(createAnnounceDto, userId);
  }

  // Récupération de toutes les annonces (protégée)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    console.log('Utilisateur connecté :', req.user);
    return await this.announcesService.findAll();
  }

  // Récupération d’une annonce par ID (protégée)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    console.log('Utilisateur connecté :', req.user);
    return await this.announcesService.findOne(+id);
  }

  // Mise à jour d’une annonce (protégée)
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

  // Suppression d’une annonce (protégée)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.announcesService.remove(+id, userId);
  }
}
