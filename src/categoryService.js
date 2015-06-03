rlTaxonomy.factory('categoryService', ['$http', 'serviceUtil', '$q',
  function($http, serviceUtil, $q) {
    var _TAXONOMY_DETAILS_TTL = 5000;           // How long a particular taxonomy details fetch is "good" for. -ELW
    var _lTaxonomyDetailsLastFetch = 0;           // The time that the taxonomy details was last fetched. -ELW
    var _oTaxonomyDetailsData = null;           // The taxonomy detail data that was last fetched. -ELW

    // Clear out any cached data, probably because it's (about to become) invalid. -ELW
    function clearCachedData()
    {
      _oTaxonomyDetailsData = null;
    }

    return {
      // General note: We don't want to display the loading bar for type-ahead (or other?) searches. -ELW
      getTaxonomyDetails: function()
      {
        //console.log('Getting taxonomy details');
        // See if we already have a non-expired set of taxonomy details data available. If we do, just use it. Otherwise, fetch from the server, and use that. -ELW
        var oDeferred = $q.defer();
        // It's fine for now to just have this simple check, because the process for displaying entity details will have one taxonomy details fetch complete
        // before the next one is attempted. If we ever get to the point where those two fetches might overlap, we may want to revise this a bit to be able
        // to detect that one fetch is in-progress, and wait for its result, and then return that. -ELW
        if ((null === _oTaxonomyDetailsData) || (_TAXONOMY_DETAILS_TTL < (Date.now() - _lTaxonomyDetailsLastFetch)))
        {
          //console.log('fetching');
          $http.get(serviceUtil.taxonomyBase + 'taxonomies/' + encodeURIComponent(serviceUtil.taxonomyUUID) + '/details/')
          .success(function(oData)
          {
            //console.log('fetch done');
            //console.log(oData);
            _oTaxonomyDetailsData = oData;
            _lTaxonomyDetailsLastFetch = Date.now();
            oDeferred.resolve(oData);
          })
          .error(function(oData)
          {
            //console.log('error fetching');
            //console.log(oData);
            oDeferred.reject({data: oData});
          });
        }
        else
        {
          //console.log('already fetched');
          //console.log(_oTaxonomyDetailsData);
          oDeferred.resolve(_oTaxonomyDetailsData);
        }
        return oDeferred.promise;
      },

      doGeneralSearch: function(strSearchString)
      {
        return $http.get(serviceUtil.taxonomyBase + 'search?taxonomy=' + encodeURIComponent(serviceUtil.taxonomyName) + '&name=' + encodeURIComponent(strSearchString), { ignoreLoadingBar: true });
      },

      getUnassignedEntities: function()
      {
        return $http.get(serviceUtil.taxonomyBase + 'entities/unassigned');
      },

      getEntityDetails: function(strEntityUuid)
      {
        return $http.get(serviceUtil.taxonomyBase + 'entities/' + encodeURIComponent(strEntityUuid));
      },

      doCategorySearch: function(strSearchString)
      {
        return $http.get(serviceUtil.taxonomyBase + 'search?taxonomy=' + encodeURIComponent(serviceUtil.taxonomyName) + '&type=category&name=' + encodeURIComponent(strSearchString), { ignoreLoadingBar: true });
      },

      doEntitySearch: function(strSearchString)
      {
        return $http.get(serviceUtil.taxonomyBase + 'search?type=entity&name=' + encodeURIComponent(strSearchString), { ignoreLoadingBar: true });
      },

      addEntityToCategory: function(strEntityUuid, strCategoryUuid)
      {
        clearCachedData();    // Clear out cached data, because it won't be valid after this. -ELW
        return $http.post(serviceUtil.taxonomyBase + 'entities/' + encodeURIComponent(strEntityUuid) + '/categories?categoryUuids=' + encodeURIComponent(strCategoryUuid));
      },

      removeEntityFromCategory: function(strEntityUuid, strCategoryUuid)
      {
        clearCachedData();    // Clear out cached data, because it won't be valid after this. -ELW
        return $http.delete(serviceUtil.taxonomyBase + 'entities/' + encodeURIComponent(strEntityUuid) + '/categories?categoryUuids=' + encodeURIComponent(strCategoryUuid));
      },

      getCategoryData: function(strCategoryUuid)
      {
        return $http.get(serviceUtil.taxonomyBase + 'categories/' + encodeURIComponent(strCategoryUuid) + '/descendants?immediateDesc=true');
      },

      addNewCategory: function(strCategoryName, strParentUuid)
      {
        clearCachedData();    // Clear out cached data, because it won't be valid after this. -ELW
        return $http.post(serviceUtil.taxonomyBase + 'categories/new?taxonomyUuid=' + encodeURIComponent(serviceUtil.taxonomyUUID) + '&name=' +
          encodeURIComponent(strCategoryName) + '&description=' + encodeURIComponent(strCategoryName) + '&urlFragment=foobar' +
          ((0 === strParentUuid.length) ? '' : '&parentCategoryUuid=' + encodeURIComponent(strParentUuid)));
      },

      renameCategory: function(strCategoryUuid, strNewCategoryName)
      {
        clearCachedData();    // Clear out cached data, because it won't be valid after this. -ELW
        return $http.put(serviceUtil.taxonomyBase + 'categories/' + encodeURIComponent(strCategoryUuid) + '/?name=' + encodeURIComponent(strNewCategoryName));
      },

      removeCategory: function(strCategoryUuid)
      {
        clearCachedData();    // Clear out cached data, because it won't be valid after this. -ELW
        return $http.delete(serviceUtil.taxonomyBase + 'categories/' + encodeURIComponent(strCategoryUuid));
      },

      moveCategory: function(strCategoryUuid, strDestinationCategoryUuid)
      {
        clearCachedData();    // Clear out cached data, because it won't be valid after this. -ELW
        return $http.put(serviceUtil.taxonomyBase + 'categories/' + encodeURIComponent(strCategoryUuid) + '/move?referenceCategoryUuid=' + encodeURIComponent(strDestinationCategoryUuid));
      }
    };
  }
])