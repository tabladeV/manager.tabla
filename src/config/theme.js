import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false, // Set to true if you want to use the user's system preference
};

const theme = extendTheme({ config });

export default theme;
