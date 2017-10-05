import Backbone from 'backbone';
import Marionette from 'backbone.marionette';

import template from './RootFiltersView.hbs';
import './RootFiltersView.css';

import TimeFilterView from './TimeFilterView';
import AreaFilterView from './AreaFilterView';
import ExtraParametersListView from './ExtraParametersListView';

const RootFiltersView = Marionette.LayoutView.extend({
  template,
  templateHelpers() {
    const searchModelsWithParameters = this.searchCollection
      .filter(searchModel => searchModel.get('layerModel').get('search.parameters'));
    return {
      searchModelsWithParameters,
      layerIdsWithParameters: searchModelsWithParameters.map(searchModel => searchModel.get('layerModel').get('id')),
    };
  },
  tagName: 'form',
  className: 'filters-view',
  regions: {
    timeFilter: '#time-filter',
    areaFilter: '#area-filter',
    extraParameters: '#extra-parameters',
  },

  initialize(options) {
    this.mapModel = options.mapModel;
    this.highlightModel = options.highlightModel;
    this.filtersModel = options.filtersModel;
    this.searchCollection = options.searchCollection;
  },

  onBeforeShow() {
    const options = {
      mapModel: this.mapModel,
      highlightModel: this.highlightModel,
      filtersModel: this.filtersModel,
    };
    this.showChildView('timeFilter', new TimeFilterView(options));
    this.showChildView('areaFilter', new AreaFilterView(options));

    this.templateHelpers().searchModelsWithParameters.forEach((searchModel) => {
      const layerModel = searchModel.get('layerModel');
      const layerId = layerModel.get('id');
      this.addRegion(`extraParameters${layerId}`, `#extra-parameters-${layerId}`);
      this.showChildView(`extraParameters${layerId}`, new ExtraParametersListView(Object.assign({}, options, {
        searchModel,
        collection: new Backbone.Collection(layerModel.get('search.parameters')),
        // filtersModel: layerModel.get('filter')
      })));
    });
  },
});

export default RootFiltersView;
