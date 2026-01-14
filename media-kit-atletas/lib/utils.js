// lib/utils.js

export const safeVal = (val, defaultValue = '') => (val === null || val === undefined) ? defaultValue : val;

export const formatNumber = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const limparSlug = (texto) => {
    return texto.toString().toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Helper para parsear estatísticas de audiência (Ex: "80% Homens")
export const parseGenderStats = (genderStr) => {
    const menMatch = (genderStr || '').match(/(\d+)% Homens/);
    const womenMatch = (genderStr || '').match(/(\d+)% Mulheres/);
    return {
        men: menMatch ? menMatch[1] : '',
        women: womenMatch ? womenMatch[1] : ''
    };
};

export const parseAgeStats = (ageStr) => {
    const match = (ageStr || '').match(/(\d+)-(\d+)/);
    return {
        min: match ? match[1] : '',
        max: match ? match[2] : ''
    };
};

export const parseCityStats = (citiesStr) => {
    if (!citiesStr) return [];
    return citiesStr.split(',').map(item => {
        const match = item.match(/(.+)\s\((\d+)%\)/);
        return match ? { name: match[1].trim(), percent: match[2] } : null;
    }).filter(Boolean);
};
