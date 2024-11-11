export enum TaskStage {
    SALE_COMPLETED = 'VENDA REALIZADA', // -> Primeira etapa padrão  
    DOCUMENTS_ISSUANCE = 'EMISSÃO DE DOCUMENTOS DE COLETA',
    COLLECTION = 'COLETA',
    DELIVERY_DOCUMENTS_ISSUANCE = 'EMISSÃO DE DOCUMENTOS DE ENTREGA',
    DELIVERY = 'ENTREGA',
    DELIVERY_CONFIRMATION = 'CONFIRMAÇÃO DE ENTREGA',
    BUDGET_CHECK = 'CONFERÊNCIA DE ORÇAMENTO',
}