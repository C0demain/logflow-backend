import axios from "axios";

async function fetchAddressByCep(cep: string) {
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {
            throw new Error("CEP não encontrado.");
        }
        return {
            zipCode: cep,
            state: response.data.uf,
            city: response.data.localidade,
            neighborhood: response.data.bairro,
            street: response.data.logradouro,
        }
    } catch (error) {
        throw new Error(`Erro ao buscar endereço: ${error.message}`);
    }
}

export default fetchAddressByCep;