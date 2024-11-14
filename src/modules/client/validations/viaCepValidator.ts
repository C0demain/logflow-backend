import { BadRequestException } from "@nestjs/common";
import axios from "axios";

async function fetchAddressByCep(cep: string) {
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {
            throw new BadRequestException("CEP não encontrado.");
        }
        return {
            zipCode: cep,
            state: response.data.uf,
            city: response.data.localidade,
            neighborhood: response.data.bairro,
            street: response.data.logradouro,
        }
    } catch (error) {
        throw new BadRequestException(`Erro ao buscar endereço.`);
    }
}

export default fetchAddressByCep;