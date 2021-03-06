<!--
Copyright 2017 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <div id="form-overview">
    <loading :state="initiallyLoading"/>
    <div v-show="dataExists" class="row">
      <div class="col-xs-6">
        <form-overview-right-now v-if="form != null"/>
        <page-section condensed>
          <template #heading>
            <span>Checklist</span>
          </template>
          <template #body>
            <form-checklist/>
          </template>
        </page-section>
      </div>
      <div v-if="formDraft != null" id="form-overview-draft" class="col-xs-6">
        <page-section v-if="formDraft.isDefined()" condensed>
          <template #heading>
            <span>Your Current Draft</span>
          </template>
          <template #body>
            <form-version-summary-item :version="formDraft.get()">
              <template #body>
                <p><strong>Draft version</strong> of this Form.</p>
              </template>
            </form-version-summary-item>
            <form-draft-checklist/>
          </template>
        </page-section>
        <page-section v-else condensed>
          <template #heading>
            <span>No Current Draft</span>
          </template>
          <template #body>
            <p>
              There is not currently a Draft version of this Form. If you want
              to make changes to the Form or its Media Files, start by creating
              a Draft using the button above.
            </p>
          </template>
        </page-section>
      </div>
    </div>
  </div>
</template>

<script>
import FormChecklist from './checklist.vue';
import FormDraftChecklist from '../form-draft/checklist.vue';
import FormOverviewRightNow from './overview/right-now.vue';
import FormVersionSummaryItem from '../form-version/summary-item.vue';
import Loading from '../loading.vue';
import PageSection from '../page/section.vue';
import validateData from '../../mixins/validate-data';
import { apiPaths } from '../../util/request';
import { noop } from '../../util/util';
import { requestData } from '../../store/modules/request';

// The component does not assume that this data will exist when the component is
// created.
const REQUEST_KEYS = ['project', 'form', 'formDraft', 'attachments', 'formActors'];

export default {
  name: 'FormOverview',
  components: {
    FormChecklist,
    FormDraftChecklist,
    FormOverviewRightNow,
    FormVersionSummaryItem,
    Loading,
    PageSection
  },
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
    ...requestData(['form', 'formDraft']),
    initiallyLoading() {
      return this.$store.getters.initiallyLoading(REQUEST_KEYS);
    },
    dataExists() {
      return this.$store.getters.dataExists(REQUEST_KEYS);
    }
  },
  watch: {
    $route: 'fetchData'
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.$store.dispatch('get', [{
        key: 'formActors',
        url: apiPaths.formActors(this.projectId, this.xmlFormId, 'app-user'),
        resend: false
      }]).catch(noop);
    }
  }
};
</script>

<style lang="scss">
@import '../../assets/scss/variables';

#form-overview-draft {
  background-color: #ddd;
  margin-top: -$margin-top-page-body;
  padding-top: $margin-top-page-body;

  .page-section-heading > span:first-child {
    color: $color-accent-secondary;
  }
}
</style>
