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
      this.handleExceptions(error);
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

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)
    if(updatePokemonDto.name)
    updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto)
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error);
    }
    //return `This action updates a #${id} pokemon`;
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne()
    const  {deletedCount} = await this.pokemonModel.deleteOne({ _id:id });
    if(deletedCount ===0 ){
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
    return {msg: "Pokemon deleted"};
  }

  private handleExceptions(error:any){
    console.log(error);
    if (error.code === 11000){
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}` )
    }
    throw new InternalServerErrorException(`Can't update pokemon - Check Server logs`)
  }
}
