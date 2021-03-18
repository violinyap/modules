import React from 'react';

type Props = {
  children?: never;
  className?: string;
};

const index: React.FC<Props> = (props) => {
  return <div>This is spawned from the share package</div>;
};

export default {
  toSpawn: () => true,
  body: index,
  label: 'Share Test Tab',
  iconName: 'build',
};
