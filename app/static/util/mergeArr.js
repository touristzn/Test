//类似于$.extend，和$.extend的区别是能更改数组的长度
export default function merge(target){
	function extend(target, source, deep) {
		for (var key in source) {
			if (deep && ($.isPlainObject(source[key]) || (Array.isArray(source[key]) && source[key].length > 0))) {
				if ($.isPlainObject(source[key]) && !$.isPlainObject(target[key])){
					target[key] = {};
				}
				if (Array.isArray(source[key]) && !Array.isArray(target[key])){
					target[key] = [];
				}
				extend(target[key], source[key], deep);
			}
			else if (source[key] !== undefined) target[key] = source[key];
		}
		if( Array.isArray(source) && deep && deep !== 'merge' ){
			target.length = source.length;
		}
	}

	var deep = true, args = Array.prototype.slice.call(arguments, 1);
	if (typeof target == 'boolean' || target == 'merge') {
		deep = target;
		target = args.shift();
	}
	args.forEach(function(arg){
		extend(target, arg, deep);
	});
	return target;
}