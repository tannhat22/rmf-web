import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project import
import { useLocales } from 'locales';
import MainCard from 'components/MainCard';

// assets

import { HomeFilled, HomeOutlined } from '@ant-design/icons';
// types
import { OverrideIcon } from 'types/root';
import { NavItemType } from 'types/menu';

// ==============================|| BREADCRUMBS ||============================== //

export interface BreadCrumbSxProps extends CSSProperties {
  mb?: string;
  bgcolor?: string;
}

interface Props {
  card?: boolean;
  divider?: boolean;
  icon?: boolean;
  icons?: boolean;
  maxItems?: number;
  navigation?: { items: NavItemType[] };
  rightAlign?: boolean;
  separator?: OverrideIcon;
  title?: boolean;
  sx?: BreadCrumbSxProps;
}

const Breadcrumbs = ({
  card,
  divider = true,
  icon,
  icons,
  maxItems,
  navigation,
  rightAlign,
  separator,
  title,
  sx,
  ...others
}: Props) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { translate, currentLang } = useLocales();
  const [breadCrumbs, setBreadCrumbs] = useState<NavItemType[]>();
  // const [section, setSection] = useState<string>();

  const iconSX = {
    marginRight: theme.spacing(0.75),
    marginTop: `-${theme.spacing(0.25)}`,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main,
  };

  const pathnames = pathname.split('/').filter(Boolean);
  let items: NavItemType[] = [];
  // let ids: string[] = [];

  useEffect(() => {
    navigation?.items?.map((menu: NavItemType) => {
      if (menu.type && menu.type === 'group') {
        getCollapse(menu as { children: NavItemType[]; type?: string }, 1);
      }
      return false;
    });

    if (items && items.length) {
      setBreadCrumbs(items);
      // if (ids?.length) setSection(ids[0]);
    }
  }, [pathname, currentLang]);

  const getCollapse = (menu: NavItemType, depth: number = 0) => {
    if (menu.children) {
      menu.children.filter((collapse: NavItemType) => {
        if (collapse.type && collapse.type === 'collapse') {
          // const path = `${pathnames.slice(0, depth).join('-')}`;
          // console.log(pathnames[depth]);
          if (pathnames[depth] === collapse.id) {
            // ids.push(menu.id!);
            items.push(collapse);
          }
          getCollapse(collapse as { children: NavItemType[]; type?: string }, depth + 1);
        } else if (collapse.type && collapse.type === 'item') {
          if (pathname === collapse.url) {
            items.push(collapse);
          }
        }
        return false;
      });
    }
  };

  // item separator
  const SeparatorIcon = separator!;
  const separatorIcon = separator ? (
    <SeparatorIcon style={{ fontSize: '0.75rem', marginTop: 2 }} />
  ) : (
    '/'
  );

  let breadcrumbContent: ReactElement = <Typography />;

  if (breadCrumbs && breadCrumbs.length) {
    const main: NavItemType | null = breadCrumbs.length > 1 ? breadCrumbs[0] : null;
    const last: NavItemType = breadCrumbs.pop()!;
    const subItems = breadCrumbs.slice(1);

    breadcrumbContent = last.breadcrumbs ? (
      <>
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 1.5, ...sx }}
          {...others}
          content={card}
          shadow="none"
        >
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            <Grid item>
              <MuiBreadcrumbs
                aria-label="breadcrumb"
                maxItems={maxItems || 8}
                separator={separatorIcon}
              >
                <Typography
                  component={Link}
                  to="/dashboard"
                  color="textSecondary"
                  variant="h6"
                  sx={{ textDecoration: 'none' }}
                >
                  {icons && <HomeOutlined style={iconSX} />}
                  {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
                  {(!icon || icons) && translate('Home')}
                </Typography>
                {main ? (
                  <Typography variant="h6" sx={{ textDecoration: 'none' }} color="textSecondary">
                    {translate(main.title)}
                  </Typography>
                ) : null}
                {subItems &&
                  subItems.length &&
                  subItems.map((subItem) => (
                    <Typography
                      key={subItem.id}
                      variant="h6"
                      sx={{ textDecoration: 'none' }}
                      color="textSecondary"
                    >
                      {subItem.title}
                    </Typography>
                  ))}
                <Typography variant="subtitle1" color="textPrimary">
                  {translate(last.title)}
                </Typography>
              </MuiBreadcrumbs>
            </Grid>
            {/* {title && (
              <Grid item sx={{ mb: card === false ? 0.25 : 1.5 }}>
                <Typography variant="h2">
                  {translate(last.title)}
                </Typography>
              </Grid>
            )} */}
          </Grid>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      </>
    ) : (
      <Typography />
    );
  }

  return breadcrumbContent;
};

export default Breadcrumbs;
