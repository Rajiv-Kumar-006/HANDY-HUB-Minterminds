import api from './api';

export interface Service {
    _id: string;
    name: string;
    title: string;
    description: string;
    category: 'cleaning' | 'cooking' | 'laundry';
    icon: string;
    basePrice: {
        min: number;
        max: number;
    };
    duration: {
        min: number;
        max: number;
    };
    requirements: string[];
    includes: string[];
    isActive: boolean;
    popularity: number;
    averageRating: number;
    totalReviews: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceCategory {
    name: string;
    label: string;
    description: string;
}

export const serviceService = {
    // Get all services
    getAllServices: async (params?: {
        category?: string;
        active?: boolean;
        page?: number;
        limit?: number;
    }) => {
        const response = await api.get('/services', { params });
        return response.data;
    },

    // Get service by ID
    getServiceById: async (id: string) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    // Get service categories
    getServiceCategories: async (): Promise<{ success: boolean; data: ServiceCategory[] }> => {
        const response = await api.get('/services/categories');
        return response.data;
    },
};