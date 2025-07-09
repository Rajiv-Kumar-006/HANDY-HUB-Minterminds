import api from './api';

export interface WorkerApplicationData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string; 
    services: string[];
    experience: string;
    hourlyRate: string;
    availability: string[];
    bio: string;
    hasConvictions: boolean;
    convictionDetails: string;
}

export interface DocumentUploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        originalName: string;
    };
}

export interface WorkerApplication {
    _id: string;
    user: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    services: string[];
    experience: string;
    hourlyRate: number;
    availability: string[];
    bio: string;
    documents: {
        idDocument?: {
            url: string;
            originalName: string;
            uploadedAt: string;
        };
        certifications: Array<{
            name: string;
            url: string;
            originalName: string;
            uploadedAt: string;
        }>;
    };
    backgroundCheck: {
        hasConvictions: boolean;
        convictionDetails: string;
        status: 'pending' | 'approved' | 'rejected';
    };
    applicationStatus: 'incomplete' | 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const workerService = {
    // Submit initial worker application
    submitApplication: async (data: WorkerApplicationData) => {
        const response = await api.post('/workers/apply', data);
        return response.data;
    },

    // Upload documents
    uploadDocument: async (file: File, documentType: 'idDocument' | 'certification'): Promise<DocumentUploadResponse> => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', documentType);

        const response = await api.post('/workers/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Submit application for review
    submitForReview: async () => {
        const response = await api.put('/workers/submit');
        return response.data;
    },

    // Get current worker application
    getMyApplication: async (): Promise<{ success: boolean; data: WorkerApplication }> => {
        const response = await api.get('/workers/me');
        return response.data;
    },

    // Update worker application
    updateApplication: async (data: Partial<WorkerApplicationData>) => {
        const response = await api.put('/workers/me', data);
        return response.data;
    },
};