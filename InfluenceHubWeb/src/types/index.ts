// Shared Types

export interface User {
    id: string;
    email: string;
    role: 'Brand' | 'Influencer' | 'Admin';
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}
