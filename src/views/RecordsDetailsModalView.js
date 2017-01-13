import ModalView from 'eoxc/src/core/views/ModalView';
import OpenLayersMapView from 'eoxc/src/contrib/OpenLayers/OpenLayersMapView';
import RecordDetailsView from 'eoxc/src/search/views/RecordDetailsView';

import FiltersModel from 'eoxc/src/core/models/FiltersModel';
import HighlightModel from 'eoxc/src/core/models/HighlightModel';
import MapModel from 'eoxc/src/core/models/MapModel';

import template from './RecordsDetailsModalView.hbs';

const RecordsDetailsModalView = ModalView.extend({
  template,
  templateHelpers() {
    return {
      title: '',
      hasNext: this.currentRecordIndex < this.records.length - 1,
      hasPrev: this.currentRecordIndex > 0,
      hasMore: this.records.length > 1,
    };
  },

  events: {
    'click .records-next': 'onRecordsNextClicked',
    'click .records-prev': 'onRecordsPrevClicked',
    'shown.bs.modal': 'onModalShown',
    'change .is-selected': 'onDownloadSelectionChange',
  },

  initialize(options) {
    this.records = options.records;
    this.currentRecordIndex = 0;

    this.baseLayersCollection = options.baseLayersCollection;
    this.overlayLayersCollection = options.overlayLayersCollection;
    this.layersCollection = options.layersCollection;
    this.highlightStrokeColor = options.highlightStrokeColor;

    this.mapModel = new MapModel({ center: [0, 0], zoom: 5 });
    this.highlightModel = new HighlightModel();
    this.filtersModel = new FiltersModel();
  },

  onModalShown() {
    this.updateRecord(...this.records[this.currentRecordIndex]);
  },

  updateRecord(recordModel, searchModel) {
    // if (!this.mapView) {
      this.mapView = new OpenLayersMapView({
        mapModel: this.mapModel,
        filtersModel: this.filtersModel,
        highlightModel: this.highlightModel,
        baseLayersCollection: this.baseLayersCollection,
        overlayLayersCollection: this.overlayLayersCollection,
        layersCollection: this.layersCollection,
        highlightFillColor: 'rgba(0, 0, 0, 0)',
        highlightStrokeColor: this.highlightStrokeColor,
      });
    // }
    const detailsView = new RecordDetailsView({
      model: recordModel,
      mapModel: this.mapModel,
      mapView: this.mapView,
    });
    this.showChildView('content', detailsView);

    const time = recordModel.get('properties').time;
    const layerModel = searchModel.get('layerModel');

    this.mapModel.show(recordModel.attributes);
    this.highlightModel.highlight(recordModel.attributes);
    this.filtersModel.set('time', time);

    this.$('.modal-title').text(`${layerModel.get('displayName')} - ${time[0].toISOString()}`);
    this.$('.records-prev').toggleClass('disabled', !(this.currentRecordIndex > 0));
    this.$('.records-next').toggleClass('disabled', !(this.currentRecordIndex < this.records.length - 1));


    const downloadSelection = searchModel.get('downloadSelection');
    const isSelectedForDownload = downloadSelection.findIndex(model => (
      model.get('id') === recordModel.get('id')
    )) !== -1;
    this.$('.is-selected').prop('checked', isSelectedForDownload);
  },

  onRecordsPrevClicked() {
    if (this.currentRecordIndex > 0) {
      this.currentRecordIndex -= 1;
      this.updateRecord(...this.records[this.currentRecordIndex]);
    }
  },

  onRecordsNextClicked() {
    if (this.currentRecordIndex < this.records.length - 1) {
      this.currentRecordIndex += 1;
      this.updateRecord(...this.records[this.currentRecordIndex]);
    }
  },

  onDownloadSelectionChange() {
    const [recordModel, searchModel] = this.records[this.currentRecordIndex];
    const downloadSelection = searchModel.get('downloadSelection');
    if (this.$('.is-selected').is(':checked')) {
      downloadSelection.add(recordModel);
    } else {
      downloadSelection.remove(recordModel);
    }
  },
});

export default RecordsDetailsModalView;
