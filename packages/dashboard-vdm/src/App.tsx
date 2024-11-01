// i18n
import 'locales/i18n';

// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';
import ThemeLocalization from 'locales';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth-provider
import { JWTProvider as AuthProvider } from 'auth/JWTContext';

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
