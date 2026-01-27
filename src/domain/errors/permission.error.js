"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionError = void 0;
// Permission error
var domain_error_base_1 = require("./domain-error.base");
var PermissionError = /** @class */ (function (_super) {
    __extends(PermissionError, _super);
    function PermissionError(message) {
        if (message === void 0) { message = 'Permission denied'; }
        var _this = _super.call(this, message) || this;
        _this.code = 'PERMISSION_DENIED';
        return _this;
    }
    return PermissionError;
}(domain_error_base_1.DomainError));
exports.PermissionError = PermissionError;
