/******/ (function(modules) { // webpackBootstrap
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var chunk = require("./" + "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 		hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest() {
/******/ 		try {
/******/ 			var update = require("./" + "" + hotCurrentHash + ".hot-update.json");
/******/ 		} catch (e) {
/******/ 			return Promise.resolve();
/******/ 		}
/******/ 		return Promise.resolve(update);
/******/ 	}
/******/
/******/ 	//eslint-disable-next-line no-unused-vars
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "6901e88798d68a0bf074";
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParents = [];
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = [];
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1) {
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					}
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) {
/******/ 					me.children.push(request);
/******/ 				}
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e" &&
/******/ 				name !== "t"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		fn.t = function(value, mode) {
/******/ 			if (mode & 1) value = fn(value);
/******/ 			return __webpack_require__.t(value, mode & ~1);
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (dep === undefined) hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (dep === undefined) hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle") {
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		}
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "main";
/******/ 			// eslint-disable-next-line no-lone-blocks
/******/ 			{
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted &&
/******/ 				// removed self-accepted modules should not be required
/******/ 				appliedUpdate[moduleId] !== warnUnexpectedRequire
/******/ 			) {
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/hot/log-apply-result.js":
/*!*****************************************!*\
  !*** (webpack)/hot/log-apply-result.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\nmodule.exports = function(updatedModules, renewedModules) {\n\tvar unacceptedModules = updatedModules.filter(function(moduleId) {\n\t\treturn renewedModules && renewedModules.indexOf(moduleId) < 0;\n\t});\n\tvar log = __webpack_require__(/*! ./log */ \"./node_modules/webpack/hot/log.js\");\n\n\tif (unacceptedModules.length > 0) {\n\t\tlog(\n\t\t\t\"warning\",\n\t\t\t\"[HMR] The following modules couldn't be hot updated: (They would need a full reload!)\"\n\t\t);\n\t\tunacceptedModules.forEach(function(moduleId) {\n\t\t\tlog(\"warning\", \"[HMR]  - \" + moduleId);\n\t\t});\n\t}\n\n\tif (!renewedModules || renewedModules.length === 0) {\n\t\tlog(\"info\", \"[HMR] Nothing hot updated.\");\n\t} else {\n\t\tlog(\"info\", \"[HMR] Updated modules:\");\n\t\trenewedModules.forEach(function(moduleId) {\n\t\t\tif (typeof moduleId === \"string\" && moduleId.indexOf(\"!\") !== -1) {\n\t\t\t\tvar parts = moduleId.split(\"!\");\n\t\t\t\tlog.groupCollapsed(\"info\", \"[HMR]  - \" + parts.pop());\n\t\t\t\tlog(\"info\", \"[HMR]  - \" + moduleId);\n\t\t\t\tlog.groupEnd(\"info\");\n\t\t\t} else {\n\t\t\t\tlog(\"info\", \"[HMR]  - \" + moduleId);\n\t\t\t}\n\t\t});\n\t\tvar numberIds = renewedModules.every(function(moduleId) {\n\t\t\treturn typeof moduleId === \"number\";\n\t\t});\n\t\tif (numberIds)\n\t\t\tlog(\n\t\t\t\t\"info\",\n\t\t\t\t\"[HMR] Consider using the NamedModulesPlugin for module names.\"\n\t\t\t);\n\t}\n};\n\n\n//# sourceURL=webpack:///(webpack)/hot/log-apply-result.js?");

/***/ }),

/***/ "./node_modules/webpack/hot/log.js":
/*!****************************!*\
  !*** (webpack)/hot/log.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var logLevel = \"info\";\n\nfunction dummy() {}\n\nfunction shouldLog(level) {\n\tvar shouldLog =\n\t\t(logLevel === \"info\" && level === \"info\") ||\n\t\t([\"info\", \"warning\"].indexOf(logLevel) >= 0 && level === \"warning\") ||\n\t\t([\"info\", \"warning\", \"error\"].indexOf(logLevel) >= 0 && level === \"error\");\n\treturn shouldLog;\n}\n\nfunction logGroup(logFn) {\n\treturn function(level, msg) {\n\t\tif (shouldLog(level)) {\n\t\t\tlogFn(msg);\n\t\t}\n\t};\n}\n\nmodule.exports = function(level, msg) {\n\tif (shouldLog(level)) {\n\t\tif (level === \"info\") {\n\t\t\tconsole.log(msg);\n\t\t} else if (level === \"warning\") {\n\t\t\tconsole.warn(msg);\n\t\t} else if (level === \"error\") {\n\t\t\tconsole.error(msg);\n\t\t}\n\t}\n};\n\n/* eslint-disable node/no-unsupported-features/node-builtins */\nvar group = console.group || dummy;\nvar groupCollapsed = console.groupCollapsed || dummy;\nvar groupEnd = console.groupEnd || dummy;\n/* eslint-enable node/no-unsupported-features/node-builtins */\n\nmodule.exports.group = logGroup(group);\n\nmodule.exports.groupCollapsed = logGroup(groupCollapsed);\n\nmodule.exports.groupEnd = logGroup(groupEnd);\n\nmodule.exports.setLogLevel = function(level) {\n\tlogLevel = level;\n};\n\nmodule.exports.formatError = function(err) {\n\tvar message = err.message;\n\tvar stack = err.stack;\n\tif (!stack) {\n\t\treturn message;\n\t} else if (stack.indexOf(message) < 0) {\n\t\treturn message + \"\\n\" + stack;\n\t} else {\n\t\treturn stack;\n\t}\n};\n\n\n//# sourceURL=webpack:///(webpack)/hot/log.js?");

/***/ }),

/***/ "./node_modules/webpack/hot/poll.js?100":
/*!*********************************!*\
  !*** (webpack)/hot/poll.js?100 ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(__resourceQuery) {/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n/*globals __resourceQuery */\nif (true) {\n\tvar hotPollInterval = +__resourceQuery.substr(1) || 10 * 60 * 1000;\n\tvar log = __webpack_require__(/*! ./log */ \"./node_modules/webpack/hot/log.js\");\n\n\tvar checkForUpdate = function checkForUpdate(fromUpdate) {\n\t\tif (module.hot.status() === \"idle\") {\n\t\t\tmodule.hot\n\t\t\t\t.check(true)\n\t\t\t\t.then(function(updatedModules) {\n\t\t\t\t\tif (!updatedModules) {\n\t\t\t\t\t\tif (fromUpdate) log(\"info\", \"[HMR] Update applied.\");\n\t\t\t\t\t\treturn;\n\t\t\t\t\t}\n\t\t\t\t\t__webpack_require__(/*! ./log-apply-result */ \"./node_modules/webpack/hot/log-apply-result.js\")(updatedModules, updatedModules);\n\t\t\t\t\tcheckForUpdate(true);\n\t\t\t\t})\n\t\t\t\t.catch(function(err) {\n\t\t\t\t\tvar status = module.hot.status();\n\t\t\t\t\tif ([\"abort\", \"fail\"].indexOf(status) >= 0) {\n\t\t\t\t\t\tlog(\"warning\", \"[HMR] Cannot apply update.\");\n\t\t\t\t\t\tlog(\"warning\", \"[HMR] \" + log.formatError(err));\n\t\t\t\t\t\tlog(\"warning\", \"[HMR] You need to restart the application!\");\n\t\t\t\t\t} else {\n\t\t\t\t\t\tlog(\"warning\", \"[HMR] Update failed: \" + log.formatError(err));\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t}\n\t};\n\tsetInterval(checkForUpdate, hotPollInterval);\n} else {}\n\n/* WEBPACK VAR INJECTION */}.call(this, \"?100\"))\n\n//# sourceURL=webpack:///(webpack)/hot/poll.js?");

/***/ }),

/***/ "./server/src/caseta-connection/connection-pump.ts":
/*!*********************************************************!*\
  !*** ./server/src/caseta-connection/connection-pump.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = function (d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar smart_bridge_connection_1 = __webpack_require__(/*! ./smart-bridge-connection */ \"./server/src/caseta-connection/smart-bridge-connection.ts\");\nvar events_1 = __webpack_require__(/*! events */ \"events\");\nvar PumpIntervalMilliseconds = 1000;\nvar HeartbeatIntervalMilliseconds = 5000;\nvar ConnectionPump = /** @class */ (function (_super) {\n    __extends(ConnectionPump, _super);\n    function ConnectionPump(smartBridge) {\n        var _this = _super.call(this) || this;\n        _this.smartBridge = smartBridge;\n        _this._cancellationToken = { signalled: false };\n        _this._cachedValues = {};\n        _this.updateConfig = function (updatedConfig) {\n            if (updatedConfig.ipAddress !== _this.smartBridge.ipAddress) {\n                throw new Error(\"The specified config (\" + updatedConfig.ipAddress + \") doesn't match the current config (\" + _this.smartBridge.ipAddress + \")\");\n            }\n            _this.smartBridge = updatedConfig;\n        };\n        _this.start = function () {\n            _this._cancellationToken = { signalled: false };\n            setTimeout(function () { return _this._pumpAsync(_this._cancellationToken); }, PumpIntervalMilliseconds);\n            setTimeout(function () { return _this._heartbeatAsync(_this._cancellationToken); }, HeartbeatIntervalMilliseconds);\n        };\n        _this.stop = function () {\n            _this._cancellationToken.signalled = true;\n        };\n        _this._heartbeatAsync = function (cancellationToken) { return __awaiter(_this, void 0, void 0, function () {\n            var deviceIds, nextDeviceIdToCheck;\n            var _this = this;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        if (cancellationToken.signalled) {\n                            return [2 /*return*/];\n                        }\n                        deviceIds = this.smartBridge.devices && this.smartBridge.devices\n                            .filter(function (d) { return d.type === smart_bridge_connection_1.DeviceType.State; })\n                            .map(function (d) { return d.id; })\n                            .sort(function (a, b) { return a - b; })\n                            || [];\n                        if (deviceIds.length === 0 || !this._activeConnection || this._activeConnection.status !== smart_bridge_connection_1.ConnectionStatus.Connected) {\n                            setTimeout(function () { return _this._heartbeatAsync(cancellationToken); }, HeartbeatIntervalMilliseconds);\n                            return [2 /*return*/];\n                        }\n                        nextDeviceIdToCheck = !this._lastHeartbeatDeviceId || this._lastHeartbeatDeviceId < deviceIds[0] || this._lastHeartbeatDeviceId >= deviceIds[deviceIds.length - 1]\n                            ? deviceIds[0]\n                            : deviceIds[deviceIds.indexOf(this._lastHeartbeatDeviceId) + 1];\n                        return [4 /*yield*/, this._activeConnection.pingDeviceAsync(nextDeviceIdToCheck)];\n                    case 1:\n                        _a.sent();\n                        this._lastHeartbeatDeviceId = nextDeviceIdToCheck;\n                        setTimeout(function () { return _this._heartbeatAsync(cancellationToken); }, HeartbeatIntervalMilliseconds);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._pumpAsync = function (cancellationToken) { return __awaiter(_this, void 0, void 0, function () {\n            var isHealthy;\n            var _this = this;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        this._activeConnection = this._activeConnection || this._createNewConnection();\n                        isHealthy = this._activeConnection.status === smart_bridge_connection_1.ConnectionStatus.Connected || this._activeConnection.status === smart_bridge_connection_1.ConnectionStatus.Connecting;\n                        if (!!isHealthy) return [3 /*break*/, 2];\n                        return [4 /*yield*/, this._safeCloseConnectionAsync()];\n                    case 1:\n                        _a.sent();\n                        _a.label = 2;\n                    case 2:\n                        if (!cancellationToken.signalled) return [3 /*break*/, 4];\n                        return [4 /*yield*/, this._safeCloseConnectionAsync()];\n                    case 3:\n                        _a.sent();\n                        return [2 /*return*/];\n                    case 4:\n                        setTimeout(function () { return _this._pumpAsync(cancellationToken); }, PumpIntervalMilliseconds);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._createNewConnection = function () {\n            var newConnection = new smart_bridge_connection_1.SmartBridgeConnection(_this.smartBridge.ipAddress);\n            newConnection.on('error', function (error) { return console.log('ERROR:', _this.smartBridge.ipAddress, error); });\n            newConnection.on('status', function (status) { return console.log('CONNECTION:', _this.smartBridge.ipAddress, smart_bridge_connection_1.ConnectionStatus[status]); });\n            newConnection.on('event', function (event) { return _this._updateValueFromEvent(event); });\n            return newConnection;\n        };\n        _this._updateValueFromEvent = function (event) {\n            if (_this._cachedValues[event.deviceId] == event.value) {\n                return;\n            }\n            _this._cachedValues[event.deviceId] = event.value;\n            _this.emit('event', event);\n        };\n        _this._safeCloseConnectionAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var isClosedOrClosing;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        if (!this._activeConnection)\n                            return [2 /*return*/];\n                        isClosedOrClosing = this._activeConnection.status === smart_bridge_connection_1.ConnectionStatus.Closed || this._activeConnection.status == smart_bridge_connection_1.ConnectionStatus.Closing;\n                        _a.label = 1;\n                    case 1:\n                        _a.trys.push([1, , 4, 5]);\n                        if (!!isClosedOrClosing) return [3 /*break*/, 3];\n                        return [4 /*yield*/, this._activeConnection.closeAsync()];\n                    case 2:\n                        _a.sent();\n                        _a.label = 3;\n                    case 3: return [3 /*break*/, 5];\n                    case 4:\n                        this._activeConnection = undefined;\n                        return [7 /*endfinally*/];\n                    case 5: return [2 /*return*/];\n                }\n            });\n        }); };\n        return _this;\n    }\n    return ConnectionPump;\n}(events_1.EventEmitter));\nexports.ConnectionPump = ConnectionPump;\n\n\n//# sourceURL=webpack:///./server/src/caseta-connection/connection-pump.ts?");

/***/ }),

/***/ "./server/src/caseta-connection/smart-bridge-connection.ts":
/*!*****************************************************************!*\
  !*** ./server/src/caseta-connection/smart-bridge-connection.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = function (d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar events_1 = __webpack_require__(/*! events */ \"events\");\nvar Telnet = __webpack_require__(/*! telnet-client */ \"telnet-client\");\nvar ConnectionStatus;\n(function (ConnectionStatus) {\n    ConnectionStatus[ConnectionStatus[\"Connecting\"] = 0] = \"Connecting\";\n    ConnectionStatus[ConnectionStatus[\"Connected\"] = 1] = \"Connected\";\n    ConnectionStatus[ConnectionStatus[\"Failure\"] = 2] = \"Failure\";\n    ConnectionStatus[ConnectionStatus[\"Closing\"] = 3] = \"Closing\";\n    ConnectionStatus[ConnectionStatus[\"Closed\"] = 4] = \"Closed\";\n})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));\nvar DeviceType;\n(function (DeviceType) {\n    DeviceType[DeviceType[\"Control\"] = 1] = \"Control\";\n    DeviceType[DeviceType[\"State\"] = 2] = \"State\";\n})(DeviceType = exports.DeviceType || (exports.DeviceType = {}));\nvar SmartBridgeConnection = /** @class */ (function (_super) {\n    __extends(SmartBridgeConnection, _super);\n    function SmartBridgeConnection(_ipAddress) {\n        var _this = _super.call(this) || this;\n        _this._ipAddress = _ipAddress;\n        _this._telnetConnection = new Telnet();\n        _this._initialPromptTimeout = null;\n        _this.status = ConnectionStatus.Connecting;\n        _this.pingDeviceAsync = function (deviceId) { return __awaiter(_this, void 0, void 0, function () {\n            return __generator(this, function (_a) {\n                this._telnetShell.write(\"?OUTPUT,\" + deviceId + \",1\\r\\n\", 'utf-8');\n                return [2 /*return*/];\n            });\n        }); };\n        _this.closeAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var _this = this;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        this._updateStatus(ConnectionStatus.Closing);\n                        return [4 /*yield*/, this._swallowErrorsAsync(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {\n                                switch (_a.label) {\n                                    case 0: return [4 /*yield*/, this._telnetConnection.end()];\n                                    case 1: return [2 /*return*/, _a.sent()];\n                                }\n                            }); }); })];\n                    case 1:\n                        _a.sent();\n                        return [4 /*yield*/, this._swallowErrorsAsync(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {\n                                switch (_a.label) {\n                                    case 0: return [4 /*yield*/, this._telnetConnection.destroy()];\n                                    case 1: return [2 /*return*/, _a.sent()];\n                                }\n                            }); }); })];\n                    case 2:\n                        _a.sent();\n                        this._updateStatus(ConnectionStatus.Closed);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._initiateConnectionAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var config, _a, error_1;\n            var _this = this;\n            return __generator(this, function (_b) {\n                switch (_b.label) {\n                    case 0:\n                        config = {\n                            host: this._ipAddress,\n                            port: 23,\n                            username: 'lutron',\n                            password: 'integration',\n                            timeout: 60000,\n                            negotiationMandatory: false\n                        };\n                        this._updateStatus(ConnectionStatus.Connecting);\n                        _b.label = 1;\n                    case 1:\n                        _b.trys.push([1, 4, , 5]);\n                        return [4 /*yield*/, this._telnetConnection.connect(config)];\n                    case 2:\n                        _b.sent();\n                        if (this.status !== ConnectionStatus.Connecting)\n                            return [2 /*return*/];\n                        _a = this;\n                        return [4 /*yield*/, this._telnetConnection.shell()];\n                    case 3:\n                        _a._telnetShell = _b.sent();\n                        if (this.status !== ConnectionStatus.Connecting)\n                            return [2 /*return*/];\n                        this._telnetShell.on('data', this._handleIncomingData);\n                        return [3 /*break*/, 5];\n                    case 4:\n                        error_1 = _b.sent();\n                        this._handleErrorAsync(error_1);\n                        return [2 /*return*/];\n                    case 5:\n                        this._initialPromptTimeout = setTimeout(function () {\n                            _this._handleErrorAsync(new Error('Did not receive expected response from Smart Bridge.'));\n                        }, 60000);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        // private _requestDeviceStatus = (deviceId: number, property: string) => {\n        //   for (const propertyNumber in this._devicePropertyMap)\n        //   if (this._devicePropertyMap[propertyNumber] === property) {\n        //     this._telnetShell.write(`?OUTPUT,${deviceId},${propertyNumber}\\r\\n`, 'utf-8');\n        //   }\n        // }\n        // private _setDeviceLevel = (deviceId: number, property: string, level: number) => {\n        //   for (const propertyNumber in this._devicePropertyMap)\n        //   if (this._devicePropertyMap[propertyNumber] === property) {\n        //     this._telnetShell.write(`#OUTPUT,${deviceId},1,${level}\\r\\n`, 'utf-8');\n        //   }\n        // }\n        _this._sendCommand = function (command, parameters) {\n            _this._telnetShell.write(\"?\" + command + \",\" + parameters.join(',') + \"\\r\\n\", 'utf-8');\n        };\n        _this._handleIncomingData = function (data) {\n            var message = data.toString().trim();\n            if (_this.status === ConnectionStatus.Connecting && message === 'GNET>') {\n                clearTimeout(_this._initialPromptTimeout);\n                _this._updateStatus(ConnectionStatus.Connected);\n                setTimeout(_this._heartbeat);\n                return;\n            }\n            if (_this.status === ConnectionStatus.Connected) {\n                _this._processMessage(message);\n            }\n        };\n        _this._heartbeat = function () {\n            if (_this.status !== ConnectionStatus.Connected)\n                return;\n            _this._sendCommand('SYSTEM', [10]);\n            setTimeout(_this._heartbeat, 5000);\n        };\n        _this._processMessage = function (message) {\n            var match = /~(?<type>[A-Z]+)(,(?<arguments>.*))+/g.exec(message);\n            if (!match)\n                return;\n            var messageType = match.groups.type;\n            var parameters = match.groups.arguments.split(',');\n            if (messageType === 'DEVICE') {\n                var deviceId = parseInt(parameters[0]);\n                var property = _this._getControlName(parseInt(parameters[1]));\n                var value = _this._getControlValue(parseInt(parameters[2]));\n                _this.emit('event', { deviceType: DeviceType.Control, deviceId: deviceId, property: property, value: value });\n            }\n            if (messageType === 'OUTPUT') {\n                var deviceId = parseInt(parameters[0]);\n                var property = _this._getStateName(parseInt(parameters[1]));\n                var value = _this._getStateValue(parseInt(parameters[1]), parameters[2]);\n                _this.emit('event', { deviceType: DeviceType.State, deviceId: deviceId, property: property, value: value });\n            }\n            if (messageType === 'ERROR') {\n                _this.emit('error', new Error(\"Smart Bridge Error: \" + parameters[0]));\n            }\n        };\n        _this._updateStatus = function (newStatus) {\n            _this.status = newStatus;\n            _this.emit('status', newStatus);\n        };\n        _this._handleConnectionDropAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        if (!(this.status === ConnectionStatus.Connecting || this.status === ConnectionStatus.Connected)) return [3 /*break*/, 2];\n                        return [4 /*yield*/, this._handleErrorAsync(new Error('Connection dropped unexpectedly.'))];\n                    case 1:\n                        _a.sent();\n                        _a.label = 2;\n                    case 2: return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._handleErrorAsync = function (error) { return __awaiter(_this, void 0, void 0, function () {\n            var _this = this;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        if (this.status === ConnectionStatus.Failure)\n                            return [2 /*return*/];\n                        this._updateStatus(ConnectionStatus.Failure);\n                        return [4 /*yield*/, this._swallowErrorsAsync(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {\n                                switch (_a.label) {\n                                    case 0: return [4 /*yield*/, this._telnetConnection.end()];\n                                    case 1: return [2 /*return*/, _a.sent()];\n                                }\n                            }); }); })];\n                    case 1:\n                        _a.sent();\n                        return [4 /*yield*/, this._swallowErrorsAsync(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {\n                                switch (_a.label) {\n                                    case 0: return [4 /*yield*/, this._telnetConnection.destroy()];\n                                    case 1: return [2 /*return*/, _a.sent()];\n                                }\n                            }); }); })];\n                    case 2:\n                        _a.sent();\n                        this.emit('error', error);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._swallowErrorsAsync = function (func) { return __awaiter(_this, void 0, void 0, function () {\n            var _a;\n            return __generator(this, function (_b) {\n                switch (_b.label) {\n                    case 0:\n                        _b.trys.push([0, 2, , 3]);\n                        return [4 /*yield*/, func()];\n                    case 1:\n                        _b.sent();\n                        return [3 /*break*/, 3];\n                    case 2:\n                        _a = _b.sent();\n                        return [3 /*break*/, 3];\n                    case 3: return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._getStateName = function (number) {\n            switch (number) {\n                case 1: return 'level';\n                case 2: return 'raising';\n                case 3: return 'lowering';\n                case 4: return 'stop';\n                case 8: return 'occupancy';\n                default: return \"state-\" + number;\n            }\n        };\n        _this._getStateValue = function (stateNumber, rawValue) {\n            switch (stateNumber) {\n                case 1: return parseFloat(rawValue);\n                case 8: return _this._getControlValue(parseInt(rawValue));\n                default: return rawValue;\n            }\n        };\n        _this._getControlName = function (number) {\n            switch (number) {\n                case 2: return 'on';\n                case 3: return 'favorite';\n                case 4: return 'off';\n                case 5: return 'up';\n                case 6: return 'down';\n                case 8: return 'button-1';\n                case 9: return 'button-2';\n                case 10: return 'button-3';\n                case 11: return 'button-4';\n                default: return \"control-\" + number;\n            }\n        };\n        _this._getControlValue = function (number) {\n            switch (number) {\n                case 3: return 'activated';\n                case 4: return 'deactivated';\n                default: return \"state-\" + number;\n            }\n        };\n        _this._telnetConnection.on('end', _this._handleConnectionDropAsync);\n        _this._telnetConnection.on('close', _this._handleConnectionDropAsync);\n        _this._telnetConnection.on('error', _this._handleErrorAsync);\n        setTimeout(_this._initiateConnectionAsync);\n        return _this;\n    }\n    return SmartBridgeConnection;\n}(events_1.EventEmitter));\nexports.SmartBridgeConnection = SmartBridgeConnection;\n\n\n//# sourceURL=webpack:///./server/src/caseta-connection/smart-bridge-connection.ts?");

/***/ }),

/***/ "./server/src/config-storage/config-storage.ts":
/*!*****************************************************!*\
  !*** ./server/src/config-storage/config-storage.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = function (d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar fs = __webpack_require__(/*! fs */ \"fs\");\nvar path = __webpack_require__(/*! path */ \"path\");\nvar param_case_1 = __webpack_require__(/*! param-case */ \"param-case\");\nvar events_1 = __webpack_require__(/*! events */ \"events\");\nvar smart_bridge_connection_1 = __webpack_require__(/*! ../caseta-connection/smart-bridge-connection */ \"./server/src/caseta-connection/smart-bridge-connection.ts\");\nvar configFilePath = path.join(__dirname, 'config.json');\nvar configFileEncoding = 'utf8';\nvar ConfigStorage = /** @class */ (function (_super) {\n    __extends(ConfigStorage, _super);\n    function ConfigStorage() {\n        var _this = _super.call(this) || this;\n        _this.getLatestConfigAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, this._initialLoadPromise];\n                    case 1:\n                        _a.sent();\n                        return [2 /*return*/, this._config];\n                }\n            });\n        }); };\n        _this.deleteSmartBridgeAsync = function (ipAddress) { return __awaiter(_this, void 0, void 0, function () {\n            var existingSmartBridgeIndex;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, this._initialLoadPromise];\n                    case 1:\n                        _a.sent();\n                        existingSmartBridgeIndex = this._config.smartBridges.findIndex(function (b) { return b.ipAddress === ipAddress; });\n                        if (!(existingSmartBridgeIndex >= 0)) return [3 /*break*/, 3];\n                        this._config.smartBridges.splice(existingSmartBridgeIndex, 1);\n                        return [4 /*yield*/, this._writeToDiskAsync()];\n                    case 2:\n                        _a.sent();\n                        this.emit('update', this._config);\n                        _a.label = 3;\n                    case 3: return [2 /*return*/];\n                }\n            });\n        }); };\n        _this.addSmartBridgeAsync = function (ipAddress, integrationReport) { return __awaiter(_this, void 0, void 0, function () {\n            var newSmartBridge;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, this._initialLoadPromise];\n                    case 1:\n                        _a.sent();\n                        if (this._config.smartBridges.find(function (b) { return b.ipAddress === ipAddress; })) {\n                            throw new Error(\"Smart Bridge at '\" + ipAddress + \"' already exists.\");\n                        }\n                        newSmartBridge = { ipAddress: ipAddress, devices: [] };\n                        if (integrationReport) {\n                            this._parseIntegrationReport(integrationReport, newSmartBridge);\n                        }\n                        this._config.smartBridges.push(newSmartBridge);\n                        return [4 /*yield*/, this._writeToDiskAsync()];\n                    case 2:\n                        _a.sent();\n                        this.emit('update', this._config);\n                        return [2 /*return*/, newSmartBridge];\n                }\n            });\n        }); };\n        _this.addDeviceAsync = function (ipAddress, deviceId, deviceType) { return __awaiter(_this, void 0, void 0, function () {\n            var smartBridge, newDevice;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, this._initialLoadPromise];\n                    case 1:\n                        _a.sent();\n                        smartBridge = this._config.smartBridges.find(function (b) { return b.ipAddress === ipAddress; });\n                        if (!smartBridge) {\n                            throw new Error(\"Could not save new device. There is no smart bridge configured at '\" + ipAddress + \"'.\");\n                        }\n                        if (smartBridge.devices.find(function (d) { return d.id === deviceId; })) {\n                            throw new Error(\"Could not save new device. There is already a device configured with ID '\" + deviceId + \"' for smart bridge '\" + ipAddress + \"'.\");\n                        }\n                        newDevice = { id: deviceId, type: deviceType, name: \"device-\" + deviceId, room: undefined };\n                        smartBridge.devices.push(newDevice);\n                        return [4 /*yield*/, this._writeToDiskAsync()];\n                    case 2:\n                        _a.sent();\n                        this.emit('update', this._config);\n                        return [2 /*return*/, newDevice];\n                }\n            });\n        }); };\n        _this._writeToDiskAsync = function () { return new Promise(function (resolve, reject) {\n            fs.writeFile(configFilePath, JSON.stringify(_this._config), configFileEncoding, function (error) { return error ? reject(error) : resolve(); });\n        }); };\n        _this._loadFromDiskAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var exists, fileContents;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return fs.exists(configFilePath, resolve); })];\n                    case 1:\n                        exists = _a.sent();\n                        if (!exists) return [3 /*break*/, 3];\n                        return [4 /*yield*/, new Promise(function (resolve, reject) {\n                                return fs.readFile(configFilePath, configFileEncoding, function (error, data) { return error ? reject(error) : resolve(data); });\n                            })];\n                    case 2:\n                        fileContents = _a.sent();\n                        this._config = JSON.parse(fileContents);\n                        return [3 /*break*/, 4];\n                    case 3:\n                        this._config = { smartBridges: [] };\n                        _a.label = 4;\n                    case 4: return [2 /*return*/];\n                }\n            });\n        }); };\n        _this._parseIntegrationReport = function (integrationReport, smartBridge) {\n            if (!integrationReport.LIPIdList) {\n                throw new Error('LIPIdList not found. Invalid integration report.');\n            }\n            integrationReport.LIPIdList.Devices && integrationReport.LIPIdList.Devices.forEach(function (device) {\n                if (device.ID === 1) {\n                    return; // Skip device 1, because it's a virtual device used by the smart bridge to manage scenes.\n                }\n                smartBridge.devices.push({\n                    id: device.ID,\n                    type: smart_bridge_connection_1.DeviceType.Control,\n                    name: param_case_1.paramCase(device.Name || \"device-\" + device.ID),\n                    room: param_case_1.paramCase(device.Area && device.Area.Name || undefined)\n                });\n            });\n            integrationReport.LIPIdList.Zones && integrationReport.LIPIdList.Zones.forEach(function (zone) {\n                smartBridge.devices.push({\n                    id: zone.ID,\n                    type: smart_bridge_connection_1.DeviceType.State,\n                    name: param_case_1.paramCase(zone.Name || \"device-\" + zone.ID),\n                    room: param_case_1.paramCase(zone.Area && zone.Area.Name || undefined)\n                });\n            });\n        };\n        _this._initialLoadPromise = _this._loadFromDiskAsync();\n        return _this;\n    }\n    return ConfigStorage;\n}(events_1.EventEmitter));\nexports.ConfigStorage = ConfigStorage;\n\n\n//# sourceURL=webpack:///./server/src/config-storage/config-storage.ts?");

/***/ }),

/***/ "./server/src/gateway.ts":
/*!*******************************!*\
  !*** ./server/src/gateway.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nvar __spreadArrays = (this && this.__spreadArrays) || function () {\n    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;\n    for (var r = Array(s), k = 0, i = 0; i < il; i++)\n        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)\n            r[k] = a[j];\n    return r;\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar connection_pump_1 = __webpack_require__(/*! ./caseta-connection/connection-pump */ \"./server/src/caseta-connection/connection-pump.ts\");\nvar Gateway = /** @class */ (function () {\n    function Gateway(_configStorage) {\n        var _this = this;\n        this._configStorage = _configStorage;\n        this._activeCasetaPumps = [];\n        this._running = false;\n        this.start = function () {\n            _this._running = true;\n            _this._startAsync();\n        };\n        this.stop = function () {\n            _this._running = false;\n            _this._activeCasetaPumps.forEach(function (p) { return p.stop(); });\n            _this._activeCasetaPumps = [];\n            console.log('Gateway stopped');\n        };\n        this._startAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var config;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, this._configStorage.getLatestConfigAsync()];\n                    case 1:\n                        config = _a.sent();\n                        config.smartBridges.forEach(this._startPump);\n                        console.log('Gateway started');\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        this._processEventAsync = function (event, smartBridge) { return __awaiter(_this, void 0, void 0, function () {\n            var device, mqttPath;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        device = smartBridge.devices.find(function (d) { return d.id === event.deviceId; });\n                        if (!!device) return [3 /*break*/, 2];\n                        return [4 /*yield*/, this._configStorage.addDeviceAsync(smartBridge.ipAddress, event.deviceId, event.deviceType)];\n                    case 1:\n                        device = _a.sent();\n                        _a.label = 2;\n                    case 2:\n                        mqttPath = device.room\n                            ? \"caseta/\" + device.room + \"/\" + device.name + \"/\" + event.property\n                            : \"caseta/\" + device.name + \"/\" + event.property;\n                        console.log(mqttPath, event.value);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        this._startPump = function (smartBridge) {\n            var pump = new connection_pump_1.ConnectionPump(smartBridge);\n            pump.on('event', function (event) { return _this._processEventAsync(event, smartBridge); });\n            _this._activeCasetaPumps.push(pump);\n            pump.start();\n        };\n        this._handleConfigUpdate = function (config) {\n            if (!_this._running)\n                return;\n            config.smartBridges.forEach(function (smartBridge) {\n                var runningPump = _this._activeCasetaPumps.find(function (p) { return p.smartBridge.ipAddress === smartBridge.ipAddress; });\n                if (runningPump) {\n                    runningPump.smartBridge = smartBridge;\n                }\n                else {\n                    _this._startPump(smartBridge);\n                }\n            });\n            __spreadArrays(_this._activeCasetaPumps).forEach(function (pump) {\n                if (!config.smartBridges.find(function (b) { return b.ipAddress === pump.smartBridge.ipAddress; })) {\n                    pump.stop();\n                    _this._activeCasetaPumps.splice(_this._activeCasetaPumps.indexOf(pump), 1);\n                }\n            });\n        };\n        _configStorage.on('update', this._handleConfigUpdate);\n    }\n    return Gateway;\n}());\nexports.Gateway = Gateway;\n\n\n//# sourceURL=webpack:///./server/src/gateway.ts?");

/***/ }),

/***/ "./server/src/main.ts":
/*!****************************!*\
  !*** ./server/src/main.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar config_storage_1 = __webpack_require__(/*! ./config-storage/config-storage */ \"./server/src/config-storage/config-storage.ts\");\nvar web_server_1 = __webpack_require__(/*! ./web-ui/web-server */ \"./server/src/web-ui/web-server.ts\");\nvar gateway_1 = __webpack_require__(/*! ./gateway */ \"./server/src/gateway.ts\");\nvar configStorage = new config_storage_1.ConfigStorage();\nvar gateway = new gateway_1.Gateway(configStorage);\nvar webServer = new web_server_1.WebServer(configStorage);\ngateway.start();\nwebServer.start();\nif (true) {\n    module.hot.accept();\n    module.hot.dispose(function () {\n        gateway.stop();\n        webServer.stop();\n    });\n}\n\n\n//# sourceURL=webpack:///./server/src/main.ts?");

/***/ }),

/***/ "./server/src/web-ui/data-controller.ts":
/*!**********************************************!*\
  !*** ./server/src/web-ui/data-controller.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar express_1 = __webpack_require__(/*! express */ \"express\");\nvar DataController = /** @class */ (function () {\n    function DataController(_configStorage, _webSocket) {\n        var _this = this;\n        this._configStorage = _configStorage;\n        this._webSocket = _webSocket;\n        this._wireupHandler = function (ws, req) { };\n        this._wireupRouter = function (app) {\n            console.log('wiring up router');\n            app.get('/config', _this._handleConfigRequestAsync);\n            app.post('/bridge', _this._handleNewBridgeRequestAsync);\n            app.delete('/bridge/:ipAddress', _this._handleDeleteBridgeRequestAsync);\n        };\n        this._handleConfigUpdateAsync = function (newConfig) { return __awaiter(_this, void 0, void 0, function () {\n            return __generator(this, function (_a) {\n                this._webSocket.getWss().clients.forEach(function (client) {\n                    try {\n                        client.send(JSON.stringify({\n                            type: 'config',\n                            value: newConfig\n                        }));\n                    }\n                    catch (error) {\n                        console.error(error);\n                    }\n                });\n                return [2 /*return*/];\n            });\n        }); };\n        this._handleConfigRequestAsync = function (req, res) { return __awaiter(_this, void 0, void 0, function () {\n            var _a, _b, error_1;\n            return __generator(this, function (_c) {\n                switch (_c.label) {\n                    case 0:\n                        _c.trys.push([0, 2, , 3]);\n                        _b = (_a = res).json;\n                        return [4 /*yield*/, this._configStorage.getLatestConfigAsync()];\n                    case 1:\n                        _b.apply(_a, [_c.sent()]);\n                        return [3 /*break*/, 3];\n                    case 2:\n                        error_1 = _c.sent();\n                        res.status(500).json(this._parseErrorObject(error_1));\n                        return [3 /*break*/, 3];\n                    case 3: return [2 /*return*/];\n                }\n            });\n        }); };\n        this._handleNewBridgeRequestAsync = function (req, res) { return __awaiter(_this, void 0, void 0, function () {\n            var _a, _b, error_2;\n            return __generator(this, function (_c) {\n                switch (_c.label) {\n                    case 0:\n                        _c.trys.push([0, 3, , 4]);\n                        return [4 /*yield*/, this._configStorage.addSmartBridgeAsync(req.body.ipAddress, req.body.integrationReport && JSON.parse(req.body.integrationReport))];\n                    case 1:\n                        _c.sent();\n                        _b = (_a = res).json;\n                        return [4 /*yield*/, this._configStorage.getLatestConfigAsync()];\n                    case 2:\n                        _b.apply(_a, [_c.sent()]);\n                        return [3 /*break*/, 4];\n                    case 3:\n                        error_2 = _c.sent();\n                        res.status(500).json(this._parseErrorObject(error_2));\n                        return [3 /*break*/, 4];\n                    case 4: return [2 /*return*/];\n                }\n            });\n        }); };\n        this._handleDeleteBridgeRequestAsync = function (req, res) { return __awaiter(_this, void 0, void 0, function () {\n            var _a, _b, error_3;\n            return __generator(this, function (_c) {\n                switch (_c.label) {\n                    case 0:\n                        _c.trys.push([0, 3, , 4]);\n                        return [4 /*yield*/, this._configStorage.deleteSmartBridgeAsync(req.params.ipAddress)];\n                    case 1:\n                        _c.sent();\n                        console.log(req);\n                        _b = (_a = res).json;\n                        return [4 /*yield*/, this._configStorage.getLatestConfigAsync()];\n                    case 2:\n                        _b.apply(_a, [_c.sent()]);\n                        return [3 /*break*/, 4];\n                    case 3:\n                        error_3 = _c.sent();\n                        res.status(500).json(this._parseErrorObject(error_3));\n                        return [3 /*break*/, 4];\n                    case 4: return [2 /*return*/];\n                }\n            });\n        }); };\n        this.webSocketHandler = this._wireupHandler;\n        this.apiRouter = express_1.Router();\n        this._wireupRouter(this.apiRouter);\n        this._configStorage.on('update', this._handleConfigUpdateAsync);\n    }\n    DataController.prototype._parseErrorObject = function (error) {\n        var message = error.message || error.msg || JSON.stringify(error);\n        return { message: message };\n    };\n    return DataController;\n}());\nexports.DataController = DataController;\n\n\n//# sourceURL=webpack:///./server/src/web-ui/data-controller.ts?");

/***/ }),

/***/ "./server/src/web-ui/web-server.ts":
/*!*****************************************!*\
  !*** ./server/src/web-ui/web-server.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar express = __webpack_require__(/*! express */ \"express\");\nvar path = __webpack_require__(/*! path */ \"path\");\nvar expressWs = __webpack_require__(/*! express-ws */ \"express-ws\");\nvar bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\");\nvar data_controller_1 = __webpack_require__(/*! ./data-controller */ \"./server/src/web-ui/data-controller.ts\");\nvar webUiPort = 4600;\nvar WebServer = /** @class */ (function () {\n    function WebServer(_configStorage) {\n        this._configStorage = _configStorage;\n        this._webSocket = expressWs(express());\n        this._app = this._webSocket.app;\n        this._wireupMiddleware(this._app, this._webSocket);\n    }\n    WebServer.prototype.start = function () {\n        if (this._isRunning)\n            this.stop();\n        this._isRunning = true;\n        this._runningServer = this._app.listen(webUiPort, function () {\n            console.log(\"Server started at http://localhost:\" + webUiPort);\n        });\n    };\n    WebServer.prototype.stop = function () {\n        if (!this._isRunning)\n            return;\n        this._isRunning = false;\n        this._runningServer.close(function () {\n            console.log('Server stopped');\n        });\n    };\n    WebServer.prototype._wireupMiddleware = function (server, webSocket) {\n        var dataController = new data_controller_1.DataController(this._configStorage, webSocket);\n        var staticFolder = path.join(__dirname, 'www');\n        server.ws('/websocket', dataController.webSocketHandler);\n        server.use(bodyParser.json());\n        server.use('/api', dataController.apiRouter);\n        server.use(express.static(staticFolder));\n        server.get('/', function (req, res) { res.sendFile(path.join(staticFolder, 'index.html')); });\n    };\n    return WebServer;\n}());\nexports.WebServer = WebServer;\n\n\n//# sourceURL=webpack:///./server/src/web-ui/web-server.ts?");

/***/ }),

/***/ 0:
/*!*******************************************************!*\
  !*** multi webpack/hot/poll?100 ./server/src/main.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! webpack/hot/poll?100 */\"./node_modules/webpack/hot/poll.js?100\");\nmodule.exports = __webpack_require__(/*! ./server/src/main.ts */\"./server/src/main.ts\");\n\n\n//# sourceURL=webpack:///multi_webpack/hot/poll?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"events\");\n\n//# sourceURL=webpack:///external_%22events%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "express-ws":
/*!*****************************!*\
  !*** external "express-ws" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express-ws\");\n\n//# sourceURL=webpack:///external_%22express-ws%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "param-case":
/*!*****************************!*\
  !*** external "param-case" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"param-case\");\n\n//# sourceURL=webpack:///external_%22param-case%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),

/***/ "telnet-client":
/*!********************************!*\
  !*** external "telnet-client" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"telnet-client\");\n\n//# sourceURL=webpack:///external_%22telnet-client%22?");

/***/ })

/******/ });