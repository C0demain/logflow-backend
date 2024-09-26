export class ListClientDto {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly phone: string,
        readonly cnpj: string,
        readonly email: string,
        readonly address: {
            zipCode: string,
            state: string,
            city: string,
            neighborhood: string,
            street: string,
            number: string,
            complement?: string,  // Opcional
        }
    ) {};
}
