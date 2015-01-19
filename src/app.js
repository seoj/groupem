$(function() {
    
    console.log(localStorage);
    
    try {
        if(localStorage.people) {
            var people_raw = '';
            _.each(JSON.parse(localStorage.people), function(person, i) {
                people_raw += person + ', ';
            });

            $('textarea#people').val(people_raw);
        }
    } catch(e) {
        localStorage.removeItem('people');
    }
    
    try {
        if(localStorage.exclusions) {
            var exclusions_raw = '';
            _.each(JSON.parse(localStorage.exclusions), function(exclusion) {
                _.each(exclusion, function(person) {
                    exclusions_raw += person + ', ';
                });
                exclusions_raw += '\n';
            });

            $('textarea#exclusions').val(exclusions_raw);
        }   
    } 
    catch(e) {
        localStorage.removeItem('exclusions');
    }
    
    try {
        if(localStorage.size) {
            $('input[type=number]#size').val(JSON.parse(localStorage.size));
        }   
    }
    catch(e) {
        localStorage.removeItem('size');
    }

    var calculate_button = $('button#calculate');

    calculate_button.click(function() {
        var results_input = $('textarea#results');

        var output = '';
        var groups = calculate();
        _.each(groups, function(group) {
            _.each(group, function(person) {
                output += person + ',';
            });
            output += '\n';
        });

        results_input.val(output);
    });

    function calculate() {
        var people = get_people();
        var exclusions = get_exclusions();
        var size = get_size();
        
        localStorage.people = JSON.stringify(people);
        localStorage.exclusions = JSON.stringify(exclusions);
        localStorage.size = JSON.stringify(size);
        
        var num_groups = Math.ceil(people.length / size);

        var groups;
        var done = false;
        var i = 0;
        while(!done && i < 100) {
            console.log('iteration', i);
            groups = [];
            _(num_groups).times(function() {
                groups.push([]);
            });

            _.each(_.shuffle(people), function(person, i) {
                var group_num = i % num_groups;
                groups[group_num].push(person);
            });

            var group = _.find(groups, function(group) {
                var exclusion = _.find(exclusions, function(exclusion) {
                    var intersect = _.intersection(group, exclusion);
                    console.log(group, exclusion, intersect);
                    return intersect.length >= 2;
                });
                return exclusion != null;
            });

            done = group == null;
            i ++;
        }

        if(i >= 100) {
            groups = null;   
        }

        return groups;
    }

    function get_people() {
        var people_input = $('textarea#people');

        var people = [];
        _.each(people_input.val().split(','), function(person) {
            person = person.trim();
            if(person && !_.contains(people, person)) {
                people.push(person);
            }
        });
        return people;
    }

    function get_exclusions() {
        var exclusions_input = $('textarea#exclusions');

        var exclusions = [];

        var exclusions_raw = exclusions_input.val();

        _.each(exclusions_raw.split('\n'), function(group_raw) {
            var group = [];
            _.each(group_raw.split(','), function(person) {
                person = person.trim();
                if(person && !_.contains(group, person)) {
                    group.push(person);
                }
            });

            if(group.length > 0) {
                exclusions.push(group);
            }
        });

        return exclusions;
    }

    function get_size() {
        var size_input = $('input[type=number]#size');

        var size = parseInt(size_input.val());

        return size;
    }
    
});