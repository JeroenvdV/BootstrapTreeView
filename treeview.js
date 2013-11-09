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
		var child_item_count = lgi.find('li').length; //'.find()' is not optimal here
		if (child_item_count > 0) {
			var badge = $('<span class="badge childcounter">').text(child_item_count);
			lgi.prepend(badge);
		}
	});

	//When a checkbox is changed, its parents and children need to be updated.
	$('.tree input[type="checkbox"]').click(function () {
	
		checkboxChangeDown(this);
		checkboxChangeUp(this);
	});
});

//Returns the state of a checkbox out of {0,1,2} (2 being indeterminate)
function getCheckboxState(cb) {
	el = $(cb);

	if (el.prop('indeterminate')) {
		return 2;
	}
	if (el.prop('checked')) {
		return 1;
	} 
	return 0;	
}

//Sets the state of a checkbox out of {0,1,2}. Returns true if anything changed.
function setCheckboxState(el, new_state) {

	//Determine current checkbox state
	var old_state = getCheckboxState(el);

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
function updateParentCheckbox(list_item) {

	//Get this list-item's checkbox element
	var checkbox = $(list_item).children('input[type="checkbox"]:first');

	//Obtain direct children
	var child_items = $(list_item).children('ul').children('li')
	var children = child_items.children('label').children('input[type="checkbox"]');
	var children = $.merge(children, child_items.children('input[type="checkbox"]'));

	//Determine new checkbox state to-be
	var new_state = -1;
	//Counters
	var childrenon = 0;
	var childrenoff = 0;
	children.each(function (i, el) {
		//Determine checkbox state
		var child_state = getCheckboxState(el);
		
		if (2 == child_state) {
			new_state = 2;
			return false; //break
		} else {
			if (child_state) {
				childrenon++;
			} else {
				childrenoff++;
			}
			if (childrenon > 0 && childrenoff > 0) {
				new_state = 2;
				return false; //break
			}
		}
	});
	if (new_state == -1) {
		new_state = (childrenoff > 0) ? 0 : 1;
	}

	//Take action
	if (setCheckboxState(checkbox, new_state)) {
		//This item's state has changed, so propagate to its parents as well
		checkboxChangeUp(checkbox.get(0));
	}
}

//Update checkbox changes 'upwards' if necessary
function checkboxChangeUp(cb) {
	var parent2 = cb.parentElement.parentElement;

	//Determine if this checkbox has parent-checkboxes
	if ("LI" == parent2.tagName && "LI" == parent2.parentElement.parentElement.tagName) {

		//cb is a normal child, and has a parent-checkbox which may need to change
		updateParentCheckbox(parent2.parentElement.parentElement);
	} else if ("UL" == parent2.tagName && "LI" == parent2.parentElement.tagName) {
	
		//cb is a parent itself, and has a parent-checkbox which may need to change
		updateParentCheckbox(parent2.parentElement);
	}
}

//Update checkbox changes 'downwards' if necessary
function checkboxChangeDown(cb) {
	//Determine new state
	var new_state = getCheckboxState(cb);

	//Update any child-checkboxes
	$(cb.parentElement).find('input[type="checkbox"]').each(function (i, el) {
		setCheckboxState($(el), new_state);
	});
}