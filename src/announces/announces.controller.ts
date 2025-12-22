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
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AnnouncesService } from './announces.service';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class AnnouncesController {
  private readonly logger = new Logger(AnnouncesController.name);

  constructor(private readonly announcesService: AnnouncesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('images')) // champ "images" dans form-data
  async create(
    @Body() createAnnounceDto: CreateAnnounceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user?.id;
    this.logger.log(`Requête POST /upload par utilisateur #${userId}`);
    try {
      const result = await this.announcesService.create(
        createAnnounceDto,
        userId,
        file,
      );
      this.logger.log(`Annonce créée avec succès par utilisateur #${userId}`);
      return result;
    } catch (err) {
      this.logger.error(
        `Erreur lors de la création d'annonce: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException('Impossible de créer l’annonce');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    const userId = req.user?.id;
    this.logger.log(`Requête GET /upload par utilisateur #${userId}`);
    try {
      return await this.announcesService.findAll();
    } catch (err) {
      this.logger.error(
        `Erreur lors de la récupération des annonces: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException(
        'Impossible de récupérer les annonces',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    this.logger.log(`Requête GET /upload/${id} par utilisateur #${userId}`);
    try {
      return await this.announcesService.findOne(+id);
    } catch (err) {
      this.logger.error(
        `Erreur lors de la récupération de l’annonce #${id}: ${err.message}`,
        err.stack,
      );
      throw err; // NotFoundException déjà gérée dans le service
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnnounceDto: UpdateAnnounceDto,
    @Req() req,
  ) {
    const userId = req.user?.id;
    this.logger.log(`Requête PATCH /upload/${id} par utilisateur #${userId}`);
    try {
      return await this.announcesService.update(+id, updateAnnounceDto, userId);
    } catch (err) {
      this.logger.error(
        `Erreur lors de la mise à jour de l’annonce #${id}: ${err.message}`,
        err.stack,
      );
      throw err; // ForbiddenException déjà gérée dans le service
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    this.logger.log(`Requête DELETE /upload/${id} par utilisateur #${userId}`);
    try {
      return await this.announcesService.remove(+id, userId);
    } catch (err) {
      this.logger.error(
        `Erreur lors de la suppression de l’annonce #${id}: ${err.message}`,
        err.stack,
      );
      throw err; // ForbiddenException déjà gérée dans le service
    }
  }
}
