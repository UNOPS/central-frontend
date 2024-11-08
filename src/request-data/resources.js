/*
Copyright 2020 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/getodk/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
*/
import { computed, reactive, shallowReactive, watchSyncEffect } from 'vue';
import { mergeDeepLeft } from 'ramda';

import configDefaults from '../config';
import { computeIfExists, hasVerbs, setupOption, transformForm } from './util';
import { noargs } from '../util/util';
import UserPreferences from './user-preferences/preferences';

export default ({ i18n, http }, createResource) => {
  // Resources related to the session
  const session = createResource('session');
  createResource('currentUser', () => ({
    transformResponse: ({ data }) => {
      /* eslint-disable no-param-reassign */
      data.verbs = new Set(data.verbs);
      data.can = hasVerbs;
      data.preferences = new UserPreferences(data.preferences, session, http);
      /* eslint-enable no-param-reassign */
      return shallowReactive(data);
    }
  }));

  // Resources related to the system
  createResource('config', (config) => ({
    // If client-config.json is completely invalid JSON, `data` seems to be a
    // string (e.g., '{]').
    transformResponse: ({ data }) => (typeof data === 'object' && data != null
      ? mergeDeepLeft(data, configDefaults)
      : configDefaults),
    loaded: computed(() => config.dataExists && config.loadError == null)
  }));
  createResource('centralVersion');
  createResource('analyticsConfig', noargs(setupOption));
  createResource('roles', (roles) => ({
    bySystem: computeIfExists(() => {
      // Using Object.create(null) in case there is a role whose `system`
      // property is '__proto__'.
      const bySystem = Object.create(null);
      for (const role of roles)
        bySystem[role.system] = role;
      return bySystem;
    }),
    projectRoles: computeIfExists(() => {
      const { bySystem } = roles;
      // If you add a new role, make sure to also add a new i18n message.
      return [bySystem.manager, bySystem.viewer, bySystem.formfill];
    })
  }));

  // Projects and subresources
  createResource('project', (project) => ({
    /* eslint-disable no-param-reassign */
    transformResponse: ({ data }) => {
      data.verbs = new Set(data.verbs);
      data.permits = hasVerbs;
      return shallowReactive(data);
    },
    /* eslint-enable no-param-reassign */
    nameWithArchived: computeIfExists(() => (project.archived
      ? i18n.t('requestData.project.nameWithArchived', project)
      : project.name))
  }));
  createResource('form', () => ({
    transformResponse: ({ data }) => shallowReactive(transformForm(data))
  }));

  createResource('dataset', () => ({
    transformResponse: ({ data }) => shallowReactive(data)
  }));

  const formDraft = createResource('formDraft', () =>
    setupOption(data => shallowReactive(transformForm(data))));

  // Form draft attachments
  const attachments = createResource('attachments', () => ({
    ...setupOption((data) => data.reduce(
      (map, attachment) => map.set(attachment.name, reactive(attachment)),
      new Map()
    )),
    missingCount: computeIfExists(() => {
      if (attachments.isEmpty()) return 0;
      let count = 0;
      for (const attachment of attachments.get().values()) {
        if (!attachment.exists) count += 1;
      }
      return count;
    })
  }));
  watchSyncEffect(() => {
    if (formDraft.dataExists && attachments.dataExists) {
      if (formDraft.isDefined() && attachments.isEmpty())
        formDraft.setToNone();
      else if (formDraft.isEmpty() && attachments.isDefined())
        attachments.setToNone();
    }
  });
};
