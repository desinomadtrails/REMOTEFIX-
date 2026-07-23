export declare const api: {
    login(body: any): Promise<any>;
    getMe(): Promise<any>;
    getServices(): Promise<any>;
    getAllServicesAdmin(): Promise<any>;
    createService(body: any): Promise<any>;
    updateService(id: string, body: any): Promise<any>;
    toggleService(id: string): Promise<any>;
    getBookings(): Promise<any>;
    updateBookingStatus(id: string, body: {
        status: string;
        engineerId?: string;
    }): Promise<any>;
    getInvoices(): Promise<any>;
    getAuditLogs(): Promise<any>;
    seedDatabase(): Promise<any>;
};
//# sourceMappingURL=api.d.ts.map