define(['./xlsx.full.min', './FileSaver', './Blob'], function(X, saveAs, undef) {

	//DEMO:http://oss.sheetjs.com/js-xlsx/
	var XLSX = window.XLSX;

	var rABS = true;
	/* processing array buffers, only required for readAsArrayBuffer */
	function fixdata(data) {
		var o = "",
			l = 0,
			w = 10240;
		for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
		o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
		return o;
	}

	var Workbook = function() {
			if (!(this instanceof Workbook)) return new Workbook();
			this.SheetNames = [];
			this.Sheets = {};
		},

		s2ab = function(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
			return buf;
		},
		addrToString = function(obj) {
			if (/北京|天津|上海|重庆/.test(obj.province)) {
				obj.city = '';
			}
			return [obj.province, obj.city, obj.district, obj.detail].join(' ')
		},
		dateformat = function(d) {
			return d.getFullYear() * Math.pow(10, 10) + (d.getMonth() + 1) * Math.pow(10, 8) + d.getDate() * Math.pow(10, 6) + d.getHours() * Math.pow(10, 4) + d.getMinutes() * Math.pow(10, 2) + d.getSeconds() * Math.pow(10, 0);
		},
		_id2num = function(_id) {
			//16777215分之一的重复机会
			//先当它不是一个问题吧
			//它妈非得用number，这是导出目标要求的问题

			if (!_id) {
				return ''
			}
			var d = new Date(parseInt(_id.substr(0, 8), 16) * 1000);

			var dt = dateformat(d),
				indx = (parseInt(_id.substr(-6), 16) / Math.pow(10, 8)).toFixed(8).substr(2)
			return dt + indx;

		}

	return {
		handleFile: function(fileElem, fn) {
			var files = fileElem.files;
			var f = files[0];
			var reader = new FileReader();
			var name = f.name;
			reader.onload = function(e) {
				var data = e.target.result;

				var workbook;
				if (rABS) {
					/* if binary string, read with type 'binary' */
					workbook = XLSX.read(data, {
						type: 'binary'
					});
				} else {
					/* if array buffer, convert to base64 */
					var arr = fixdata(data);
					workbook = XLSX.read(btoa(arr), {
						type: 'base64'
					});
				}
				var first_sheet_name = workbook.SheetNames[0];
				var worksheet = workbook.Sheets[first_sheet_name];
				var json = XLSX.utils.sheet_to_json(worksheet, {
					//header: 1
				});
				fn && fn(json)

			};
			reader.readAsBinaryString(f);

		},
		exportFile: function(json) {

			if (!json || !json.length) {
				return alert('no data')
			}
			var arr = [
				['订单编号', '收件人', '固话', '手机', '地址', '发货信息', '备注', '代收金额', '保价金额', '业务类型']
			];
			for (var i = 0, n; n = json[i++];) {
				arr.push([
					_id2num(n._id),
					n.delivery.name,
					'',
					n.delivery.phone,
					addrToString(n.delivery),
					n.title,
					n._id,
					'',
					'',
					''
				])
			}


			var wb = new Workbook(),
				ws_name = "Sheet1",
				ws = XLSX.utils.aoa_to_sheet(arr);

			/* add worksheet to workbook */
			wb.SheetNames.push(ws_name);
			wb.Sheets[ws_name] = ws;
			var wbout = XLSX.write(wb, {
				bookType: 'xlsx',
				bookSST: true,
				type: 'binary'
			});
			//订单编号	收件人	固话	手机	地址	发货信息	备注	代收金额	保价金额	业务类型

			saveAs(new Blob([s2ab(wbout)], {
				type: "application/octet-stream"
			}), "Export-" + dateformat(new Date) + ".xlsx")

		}
	}
})