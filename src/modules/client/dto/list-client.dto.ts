export class ListClientDto {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly telefone: string,
        readonly cnpj: string,
        readonly email: string,
        readonly address: {
            estado: string,
            cidade: string,
            bairro: string,
            rua: string,
            numero: string,
            complemento?: string,  // Opcional
        }
    ) {};
}
