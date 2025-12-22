import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announce } from './entities/announce.entity';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AnnouncesService {
  private readonly logger = new Logger(AnnouncesService.name);

  constructor(
    @InjectRepository(Announce)
    private readonly announceRepo: Repository<Announce>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    createAnnounceDto: CreateAnnounceDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Announce> {
    this.logger.log(`Création d'une annonce par utilisateur #${userId}`);
    try {
      let imageUrl: string | null = null;

      if (file) {
        this.logger.log(`Upload d'image ${file.originalname} vers Supabase...`);
        const supabase = this.supabaseService.getClient();
        const fileName = `${userId}-${Date.now()}-${file.originalname}`;
        const { error } = await supabase.storage
          .from('cloud')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          this.logger.error(`Erreur upload Supabase: ${error.message}`);
          throw new InternalServerErrorException(
            'Échec de l’upload de l’image',
          );
        }

        const { data } = supabase.storage.from('cloud').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
        this.logger.log(`Image stockée avec succès: ${imageUrl}`);
      }

      const announce = this.announceRepo.create({
        ...createAnnounceDto,
        uploadedImages: imageUrl ? [imageUrl] : [],
        userId,
      });

      const saved = await this.announceRepo.save(announce);
      this.logger.log(`Annonce #${saved.id} créée avec succès`);
      return saved;
    } catch (err) {
      this.logger.error(
        `Erreur lors de la création d'annonce: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  async findAll(): Promise<Announce[]> {
    this.logger.log('Récupération de toutes les annonces');
    try {
      return await this.announceRepo.find({ relations: ['user'] });
    } catch (err) {
      this.logger.error(`Erreur findAll: ${err.message}`, err.stack);
      throw new InternalServerErrorException(
        'Impossible de récupérer les annonces',
      );
    }
  }

  async findOne(id: number): Promise<Announce> {
    this.logger.log(`Recherche de l'annonce #${id}`);
    const announce = await this.announceRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!announce) {
      this.logger.warn(`Annonce #${id} introuvable`);
      throw new NotFoundException(`Annonce #${id} introuvable`);
    }
    this.logger.log(`Annonce #${id} trouvée`);
    return announce;
  }

  async update(
    id: number,
    updateAnnounceDto: UpdateAnnounceDto,
    userId: number,
  ): Promise<Announce> {
    this.logger.log(
      `Mise à jour de l'annonce #${id} par utilisateur #${userId}`,
    );
    const announce = await this.findOne(id);
    if (announce.userId !== userId) {
      this.logger.warn(
        `Utilisateur #${userId} interdit de modifier annonce #${id}`,
      );
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres annonces',
      );
    }
    Object.assign(announce, updateAnnounceDto);
    const updated = await this.announceRepo.save(announce);
    this.logger.log(`Annonce #${id} mise à jour avec succès`);
    return updated;
  }

  async remove(id: number, userId: number): Promise<string> {
    this.logger.log(
      `Suppression de l'annonce #${id} par utilisateur #${userId}`,
    );
    const announce = await this.findOne(id);
    if (announce.userId !== userId) {
      this.logger.warn(
        `Utilisateur #${userId} interdit de supprimer annonce #${id}`,
      );
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres annonces',
      );
    }
    await this.announceRepo.remove(announce);
    this.logger.log(`Annonce #${id} supprimée avec succès`);
    return `Annonce #${id} supprimée avec succès`;
  }
}
