/**
 * Formats a date string to DD/MM/AAAA format
 * @param dateString - ISO date string or date object
 * @returns Formatted date string in DD/MM/AAAA format
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'Não informado';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    // Format as DD/MM/AAAA
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
};

/**
 * Formats a date string to DD/MM/AAAA HH:MM format
 * @param dateString - ISO date string or date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return 'Não informado';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    // Format as DD/MM/AAAA HH:MM
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Data inválida';
  }
};

/**
 * Converts a date input value (YYYY-MM-DD) to DD/MM/AAAA format for display
 * @param dateInputValue - Date input value in YYYY-MM-DD format
 * @returns Formatted date string in DD/MM/AAAA format
 */
export const formatDateInput = (dateInputValue: string): string => {
  if (!dateInputValue) return 'Não informado';
  
  try {
    // Split the YYYY-MM-DD format and rearrange to DD/MM/AAAA
    const [year, month, day] = dateInputValue.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return 'Data inválida';
  } catch (error) {
    console.error('Error formatting date input:', error);
    return 'Data inválida';
  }
};
