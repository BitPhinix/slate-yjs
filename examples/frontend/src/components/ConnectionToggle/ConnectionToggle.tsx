import React from 'react';
import ConnectedIcon from '../../../assets/connected.svg';
import DisconnectedIcon from '../../../assets/disconnected.svg';

type ConnectionToggleProps = {
  connected: boolean;
  onClick: () => void;
};

export function ConnectionToggle({
  connected,
  onClick,
}: ConnectionToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="top-4 right-4 fixed p-3 hover:bg-gray-100 rounded"
      title={connected ? 'Disconnect' : 'Connect'}
    >
      <img
        width={24}
        height={24}
        src={connected ? ConnectedIcon : DisconnectedIcon}
        alt="Connection Status"
      />
    </button>
  );
}
