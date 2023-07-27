import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      console.log(error);
      if (error.code === 11000){
        throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}` )
      }
      throw new InternalServerErrorException(`Can't create pokemon - Check Server logs`)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon : Pokemon;
    
    // no
    if( !isNaN(+term) ){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
    // MongoID 
    if( !pokemon && isValidObjectId(term) ){
      pokemon = await this.pokemonModel.findOne({_id: term})
    }

    // Name
    if( !pokemon ){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase()})
    }

    // No encontrado
    if( !pokemon ) throw new NotFoundException(`Pokemon not found ${term}`);

    return pokemon;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
