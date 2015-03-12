define(function (require) {
  return function DocRequestProvider(Private) {
    var _ = require('lodash');

    var docStrategy = Private(require('components/courier/fetch/strategy/doc'));
    var AbstractRequest = Private(require('components/courier/fetch/request/request'));

    _(DocRequest).inherits(AbstractRequest);
    function DocRequest(source, defer) {
      DocRequest.Super.call(this, source, defer);

      this.type = 'doc';
      this.strategy = docStrategy;
    }

    DocRequest.prototype.canStart = function () {
      var parent = DocRequest.Super.prototype.canStart.call(this);
      if (!parent) return false;

      // _getStoredVersion updates the internal
      // cache returned by _getVersion, so _getVersion
      // must be called first
      var version = this.source._getVersion();
      var storedVersion = this.source._getStoredVersion();

      // conditions that equal "fetch This DOC!"
      var unknownVersion = !version && !storedVersion;
      var versionMismatch = version !== storedVersion;
      var localVersionCleared = version && !storedVersion;

      if (unknownVersion || versionMismatch || localVersionCleared) return true;
    };

    DocRequest.prototype.handleResponse = function (resp) {
      if (resp.found) {
        this.source._storeVersion(resp._version);
      } else {
        this.source._clearVersion();
      }

      return DocRequest.Super.prototype.handleResponse.call(this, resp);
    };

    return DocRequest;
  };
});