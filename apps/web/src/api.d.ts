export declare const api: {
    login(body: any): Promise<any>;
    register(body: any): Promise<any>;
    getMe(): Promise<any>;
    oauthLogin(body: any): Promise<any>;
    getServices(): Promise<any>;
    getAllServicesAdmin(): Promise<any>;
    createService(body: any): Promise<any>;
    updateService(id: string, body: any): Promise<any>;
    toggleService(id: string): Promise<any>;
    createBooking(body: any): Promise<any>;
    getBookings(): Promise<any>;
    getBookingById(id: string): Promise<any>;
    updateBookingStatus(id: string, body: {
        status: string;
        engineerId?: string;
    }): Promise<any>;
    uploadBookingImage(id: string, imageBase64: string): Promise<any>;
    createTicket(body: any): Promise<any>;
    getTickets(): Promise<any>;
    getTicketById(id: string): Promise<any>;
    sendTicketMessage(id: string, message: string): Promise<any>;
    updateTicketStatus(id: string, body: {
        status: string;
        engineerId?: string;
    }): Promise<any>;
    createInvoice(body: any): Promise<any>;
    getInvoices(): Promise<any>;
    getInvoiceById(id: string): Promise<any>;
    submitPayment(body: any): Promise<any>;
    getPaymentsHistory(): Promise<any>;
    getAnalytics(): Promise<any>;
    getAuditLogs(): Promise<any>;
    seedDatabase(): Promise<any>;
};
//# sourceMappingURL=api.d.ts.map