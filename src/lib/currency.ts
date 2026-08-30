export const formatCurrency = (amount: number | string, locale: string = 'id-ID'): string => {
    if (amount === undefined || amount === null || amount === '') return '0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(locale).format(num);
};

export const parseCurrency = (formattedAmount: string): number => {
    // Remove all non-numeric characters except for the decimal separator if needed.
    // Assuming simple format: digits and potential group separators.
    return parseFloat(formattedAmount.replace(/[^\d]/g, '')) || 0;
};
