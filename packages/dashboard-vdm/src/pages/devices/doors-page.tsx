import { InitialWindow, Workspace } from 'components';
import doorsApp from 'micro-apps/doors-app';

const doorsWorkspace: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 12, h: 5.3 }, microApp: doorsApp },
];

const DoorsPage = () => {
  return (
    <Workspace initialWindows={doorsWorkspace} />
    // <Box
    //   sx={{
    //     width: '100%',
    //     height: 'calc(100vh - 246px)',
    //     border: '1px solid #ccc',
    //     borderRadius: '10px',
    //     overflow: 'hidden',
    //   }}
    // >
    //   <DoorsTable />
    // </Box>
  );
};

export default DoorsPage;
