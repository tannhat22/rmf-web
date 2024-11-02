// i18n
import 'locales/i18n';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';

// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';
import ThemeLocalization from 'locales';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth-provider
import { Auth0Provider as AuthProvider } from 'auth/Auth0Context';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => (
  <ThemeCustomization>
    <ThemeLocalization>
      <ScrollTop>
        <AuthProvider>
          <>
            <Notistack>
              <Routes />
              <Snackbar />
            </Notistack>
          </>
        </AuthProvider>
      </ScrollTop>
    </ThemeLocalization>
  </ThemeCustomization>
);

export default App;
