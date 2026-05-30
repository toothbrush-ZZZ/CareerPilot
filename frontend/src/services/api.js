"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
exports.apiRequest = apiRequest;
var useAuthStore_1 = require("@/store/useAuthStore");
var API_BASE = process.env.NEXT_PUBLIC_API_URL
    || (typeof window !== 'undefined'
        ? 'http://localhost:8000'
        : 'http://backend:8000'); // Use public override first, then local browser fallback, then Docker network fallback during SSR
function apiRequest(method_1, path_1) {
    return __awaiter(this, arguments, void 0, function (method, path, options) {
        var params, bodyData, isMultipart, customHeaders, rest, url, searchParams_1, queryStr, token, headers, body, response, errorDetail, errRes, _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    params = options.params, bodyData = options.bodyData, isMultipart = options.isMultipart, customHeaders = options.headers, rest = __rest(options, ["params", "bodyData", "isMultipart", "headers"]);
                    url = "".concat(API_BASE).concat(path);
                    if (params) {
                        searchParams_1 = new URLSearchParams();
                        Object.entries(params).forEach(function (_a) {
                            var key = _a[0], val = _a[1];
                            if (val !== undefined && val !== null) {
                                searchParams_1.append(key, String(val));
                            }
                        });
                        queryStr = searchParams_1.toString();
                        if (queryStr) {
                            url += "?".concat(queryStr);
                        }
                    }
                    token = useAuthStore_1.useAuthStore.getState().token;
                    if (!token && typeof window !== 'undefined') {
                        token = localStorage.getItem('cp_token');
                    }
                    headers = new Headers(customHeaders);
                    if (token) {
                        headers.set('Authorization', "Bearer ".concat(token));
                    }
                    body = undefined;
                    if (bodyData !== undefined) {
                        if (isMultipart) {
                            body = bodyData;
                            // Note: Fetch sets boundary automatically for FormData, do not set Content-Type manual
                        }
                        else {
                            headers.set('Content-Type', 'application/json');
                            body = JSON.stringify(bodyData);
                        }
                    }
                    return [4 /*yield*/, fetch(url, __assign({ method: method, headers: headers, body: body }, rest))];
                case 1:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 6];
                    errorDetail = 'API Request Failed';
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    errRes = _b.sent();
                    errorDetail = errRes.detail || errRes.message || errorDetail;
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5:
                    // Auto-logout on 401
                    if (response.status === 401) {
                        useAuthStore_1.useAuthStore.getState().logout();
                    }
                    throw new Error(errorDetail);
                case 6:
                    if (response.status === 204) {
                        return [2 /*return*/, {}];
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
exports.api = {
    get: function (path, params, options) {
        return apiRequest('GET', path, __assign({ params: params }, options));
    },
    post: function (path, bodyData, options) {
        return apiRequest('POST', path, __assign({ bodyData: bodyData }, options));
    },
    put: function (path, bodyData, options) {
        return apiRequest('PUT', path, __assign({ bodyData: bodyData }, options));
    },
    patch: function (path, bodyData, options) {
        return apiRequest('PATCH', path, __assign({ bodyData: bodyData }, options));
    },
    delete: function (path, options) {
        return apiRequest('DELETE', path, options);
    },
};
