<!--
Copyright 2020 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <submission-list :base-url="baseUrl"/>
</template>

<script>
import SubmissionList from '../submission/list.vue';
import validateData from '../../mixins/validate-data';
import { apiPaths } from '../../util/request';

export default {
  name: 'FormDraftTesting',
  components: { SubmissionList },
  mixins: [validateData()],
  props: {
    projectId: {
      type: String,
      required: true
    },
    xmlFormId: {
      type: String,
      required: true
    }
  },
  computed: {
    baseUrl() {
      return apiPaths.formDraft(this.projectId, this.xmlFormId);
    }
  }
};
</script>