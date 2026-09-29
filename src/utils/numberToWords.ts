const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  const digit = n % 10;
  const ten = Math.floor(n / 10);
  if (n < 100) {
    return tens[ten] + (digit > 0 ? ' ' + ones[digit] : '');
  }
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + convertLessThanThousand(remainder) : '');
}

export function numberToWords(amount: number): string {
  if (amount === 0 || isNaN(amount)) {
    return 'Sri Lankan Rupees Zero Only';
  }

  const fixed = amount.toFixed(2);
  const parts = fixed.split('.');
  let rupees = parseInt(parts[0], 10);
  const cents = parseInt(parts[1], 10);

  if (rupees === 0 && cents === 0) {
    return 'Sri Lankan Rupees Zero Only';
  }

  let words = '';

  if (rupees >= 10000000) { // Crore / 10 Million
    const millions = Math.floor(rupees / 1000000);
    words += convertLessThanThousand(millions) + ' Million ';
    rupees %= 1000000;
  } else if (rupees >= 1000000) {
    const millions = Math.floor(rupees / 1000000);
    words += convertLessThanThousand(millions) + ' Million ';
    rupees %= 1000000;
  }

  if (rupees >= 1000) {
    const thousands = Math.floor(rupees / 1000);
    words += convertLessThanThousand(thousands) + ' Thousand ';
    rupees %= 1000;
  }

  if (rupees > 0) {
    words += convertLessThanThousand(rupees);
  }

  words = words.trim();
  let result = 'Sri Lankan Rupees ' + (words || 'Zero');

  if (cents > 0) {
    result += ' and Cents ' + convertLessThanThousand(cents);
  }

  result += ' Only';
  return result;
}
