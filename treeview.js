/*!
 * BootstrapTreeView
 *
 * Requires jQuery v2.0.3
 * http://sizzlejs.com/
 *
 * Copyright 2013 Jeroen van de Ven
 * Released under the MIT license
 * https://github.com/JeroenvdV/BootstrapTreeView
 *
 * Date: 2013-11-09
 */
$(document).ready(function () {

	//Enables collapsing of the children
	$('.tree-toggle').click(function () {
		$(this).parent().children('ul.tree').slideToggle(200);
	});

	//Adds the bagdes with the number of children to parent items
	$('.tree .list-group-item').each(function (i, lgi) {
		lgi = $(lgi);
		var child_item_count = lgi.find('li').size(); //'.find()' is not optimal here
		if (child_item_count > 0) {
			var badge = $('<span class="badge childcounter">').text(child_item_count);
			lgi.prepend(badge);
		}
	});

	//When a checkbox is changed, its parents and children need to be updated.
	$('.tree input[type=checkbox]').click(function () {
	
		checkbox_change_down(this);
		checkbox_change_up(this);
	});
});

//Returns the state of a checkbox out of {0,1,2} (2 being indeterminate)
function get_checkbox_state(cb) {
	el = $(cb);

	if (el.prop('indeterminate')) {
		return 2;
	} else {
		if (el.prop('checked')) {
			return 1;
		} else {
			return 0;
		}
	}
}

//Sets the state of a checkbox out of {0,1,2}. Returns true if anything changed.
function set_checkbox_state(el, new_state) {

	//Determine current checkbox state
	var old_state = get_checkbox_state(el);

	if (new_state !== old_state) {
		if (2 == new_state) {
			el.prop('indeterminate', true);
		} else {
			el.prop('indeterminate', false);
			el.prop('checked', new_state);
		}
		return true;
	}
	return false;
}

//Determine new checkbox state due to change in children states
function update_parent_cb(list_item) {

	//Get this list-item's checkbox element
	var checkbox = $(list_item).children('input[type=checkbox]:first');

	//Obtain direct children
	var child_items = $(list_item).children('ul').children('li')
	var children = child_items.children('label').children('input[type=checkbox]');
	var children = $.merge(children, child_items.children('input[type=checkbox]'));

	//Determine new checkbox state to-be
	var new_state = -1;
	var done = false;
	//Counters
	var childrenon = 0;
	var childrenoff = 0;
	children.each(function (i, el) {
		if (!done) {
			//Determine checkbox state
			var child_state = get_checkbox_state(el);
			
			if (2 == child_state) {
				new_state = 2;
				done = true;
			} else {
				if (child_state) {
					childrenon++;
				} else {
					childrenoff++;
				}
				if (childrenon > 0 && childrenoff > 0) {
					new_state = 2;
					done = true;
				}
			}
		}
	});
	if (!done) {
		new_state = (childrenoff > 0) ? 0 : 1;
	}

	//Take action
	if (set_checkbox_state(checkbox, new_state)) {
		//This item's state has changed, so propagate to its parents as well
		checkbox_change_up(checkbox.get(0));
	}
}

//Update checkbox changes 'upwards' if necessary
function checkbox_change_up(cb) {
	var parent2 = cb.parentElement.parentElement;

	//Determine if this checkbox has parent-checkboxes
	if ("LI" == parent2.tagName && "LI" == parent2.parentElement.parentElement.tagName) {

		//cb is a normal child, and has a parent-checkbox which may need to change
		update_parent_cb(parent2.parentElement.parentElement);
	} else if ("UL" == parent2.tagName && "LI" == parent2.parentElement.tagName) {
	
		//cb is a parent itself, and has a parent-checkbox which may need to change
		update_parent_cb(parent2.parentElement);
	}
}

//Update checkbox changes 'downwards' if necessary
function checkbox_change_down(cb) {
	//Determine new state
	var new_state = get_checkbox_state(cb);

	//Update any child-checkboxes
	$(cb.parentElement).find('input[type=checkbox]').each(function (i, el) {
		set_checkbox_state($(el), new_state);
	});
}