import data from '../../../../shared/testing/data';
import constants from '../../../../api/migrations/seed/default/constants';

const publicChannel = data.channels[0];
const privateChannel = data.channels[1];

const community = data.communities.find(
  community => community.id === publicChannel.communityId
);

const { userId: ownerInChannelId } = data.usersChannels.find(
  ({ channelId, isOwner }) => channelId === publicChannel.id && isOwner
);

const { userId: memberInChannelId } = data.usersChannels.find(
  ({ channelId, isMember, isOwner }) =>
    channelId === publicChannel.id && isMember && !isOwner
);

const { userId: memberInPrivateChannelId } = data.usersChannels.find(
  ({ channelId, isMember }) => channelId === privateChannel.id && isMember
);

const QUIET_USER_ID = constants.QUIET_USER_ID;

const leave = () => {
  cy.get('[data-cy="channel-leave-button"]')
    .should('be.visible')
    .contains('Member');

  cy.get('[data-cy="channel-leave-button"]').click();

  cy.get('[data-cy="channel-join-button"]').contains(`Join channel`);
};

const join = () => {
  cy.get('[data-cy="channel-join-button"]')
    .should('be.visible')
    .contains('Join channel');

  cy.get('[data-cy="channel-join-button"]').click();

  cy.get('[data-cy="channel-leave-button"]').contains(`Member`);
};

describe('logged out channel membership', () => {
  beforeEach(() => {
    cy.visit(`/${community.slug}/${publicChannel.slug}`);
  });

  it('should render join button that links to login view', () => {
    cy.get('[data-cy="channel-login-join-button"]').should('be.visible');
  });
});

describe('channel profile as member', () => {
  beforeEach(() => {
    cy.auth(memberInChannelId).then(() =>
      cy.visit(`/${community.slug}/${publicChannel.slug}`)
    );
  });

  it('should render leave channel button', () => {
    leave();
    join();
  });
});

describe('channel profile as non-member', () => {
  beforeEach(() => {
    cy.auth(QUIET_USER_ID).then(() =>
      cy.visit(`/${community.slug}/${publicChannel.slug}`)
    );
  });

  it('should render join channel button', () => {
    join();
    leave();
  });
});

describe('channel profile as owner', () => {
  beforeEach(() => {
    cy.auth(ownerInChannelId).then(() =>
      cy.visit(`/${community.slug}/${publicChannel.slug}`)
    );
  });

  it('should render settings button', () => {
    cy.get('[data-cy="channel-settings-button"]')
      .should('be.visible')
      .contains('Settings');
  });
});

describe('private channel profile', () => {
  describe('private channel as member', () => {
    beforeEach(() => {
      cy.auth(memberInPrivateChannelId).then(() =>
        cy.visit(`/${community.slug}/${privateChannel.slug}`)
      );
    });

    it('should render profile', () => {
      cy.get('[data-cy="channel-view"]').should('be.visible');
    });
  });

  describe('private channel as non-member', () => {
    beforeEach(() => {
      cy.auth(QUIET_USER_ID).then(() =>
        cy.visit(`/${community.slug}/${privateChannel.slug}`)
      );
    });

    it('should render channel not found view', () => {
      cy.get('[data-cy="channel-view-error"]').should('be.visible');
    });
  });
});
