/* Configuration Tailwind (CDN) — palette et typographie JECI */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        emeraude: { DEFAULT: '#0F8A6C', dark: '#0A6B54', light: '#16A885' },
        marine:   { DEFAULT: '#0B1F3A', soft: '#13305A' },
        or:       { DEFAULT: '#C9962C', light: '#E0B24F' },
        ivoire:   { DEFAULT: '#F4EEE2', deep: '#EAE1CF' }
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive']
      },
      borderRadius: { jeci: '18px' },
      boxShadow: {
        soft: '0 18px 40px -18px rgba(11,31,58,.35)',
        lift: '0 30px 60px -24px rgba(11,31,58,.45)'
      }
    }
  }
};
