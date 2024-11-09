import { InitialWindow, Workspace } from 'components';
import doorsApp from 'micro-apps/doors-app';

const DoorsPage = () => {
  const hCustom = (window.innerHeight - 134 + 8) / 158;

  const doorsWorkspace: InitialWindow[] = [
    { layout: { x: 0, y: 0, w: 12, h: hCustom }, microApp: doorsApp },
  ];

  return <Workspace initialWindows={doorsWorkspace} />;
};

export default DoorsPage;
