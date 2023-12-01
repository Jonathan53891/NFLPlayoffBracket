function make_game() {
    var game = $(`
        <div class="team team-clickable">
            <div class="team_logo">&nbsp;</div>
            <div class="team_layer">&nbsp;</div>
            <div class="seed"></div>
        </div>
        <div class="team team-clickable">
            <div class="team_logo">&nbsp;</div>
            <div class="team_layer">&nbsp;</div>
            <div class="seed"></div>
        </div>
    `);
    return game;
}

function get_serial() {
    var serial = 0;
    $('.game').each(function(n, game) {
        serial *= 3;
        if($(game).find('.team').eq(0).hasClass('selected')) {
            serial += 1;
        } else if($(game).find('.team').eq(1).hasClass('selected')) {
            serial += 2;
        }
    });
    return serial;
}

function refresh_bracket(do_set_url) {
    var serial = get_serial;
    populate_teams(serial);

    if(do_set_url) {
        set_url(serial);
    }
    set_share_url(serial);
}

function set_url() {
    var serial = get_serial();
    var url = root_url + '#';
    if(serial != 0) {
        url = url + serial;
    }
    if(window.history.pushState) {
        window.history.pushState({ serial: serial }, '', url);
    }
    set_share_url();
    var ga_suffix = is_complete() ? '': 'incomplete';
    _gaq.push(['_trackPageview', url + ga_suffix]);
}

function is_complete() {
    var serial = get_serial();
    var num_flags = 0;
    while(serial > 0) {
        var flag = serial % 3;
        if(flag == 0) {
            return false;
        }
        num_flags++;
        serial = Math.floor(serial / 3);
    }
    if(num_flags == 13) {
        return true;
    }
    return false;
}


function set_share_url() {
    var serial = get_serial;
    var url = root_url + '/' + serial + '/';
    var page = new URI(window.location.toString());
    $('#share_url').attr('value', page.resolve(url));
}

window.onpopstate = function(e){
    if(e.state) {
        select_teams(e.state.serial);
    }
};

function select_teams(serial) {
    _serial = serial;
    $.each($('.game').get().reverse(), function(n, game) {
        $(game).find('.team').removeClass('selected');
        if(_serial) {
            var flag = _serial % 3;
            if(flag == 1) {
                $(game).find('.team').eq(0).addClass('selected');
            } else if(flag == 2) {
                $(game).find('.team').eq(1).addClass('selected');
            }
            _serial = Math.floor(_serial / 3);
        }
    });

    populate_teams(serial);
}

function sort_teams(teams, conf_rank) {
    teams.sort(function(a, b) {
        return $.inArray(a, conf_rank) - $.inArray(b, conf_rank);
    });
    return teams;
}

function set_teams(selector, teams) {
    $(selector).find('.team').eq(0).data('team', teams[0] || '');
    $(selector).find('.team').eq(1).data('team', teams[1] || '');
}

function populate_teams() {
    var all_teams = [teams.afc.join(' '), teams.nfc.join(' ')].join(' ');
    $('.team .team_logo').html('');
    $('.team .team_logo').removeClass(all_teams);

    set_teams('#afc_wc .game:eq(0)', [teams.afc[6], teams.afc[1]]);
    set_teams('#afc_wc .game:eq(1)', [teams.afc[5], teams.afc[2]]);
    set_teams('#afc_wc .game:eq(2)', [teams.afc[4], teams.afc[3]]);

    set_teams('#nfc_wc .game:eq(0)', [teams.nfc[6], teams.nfc[1]]);
    set_teams('#nfc_wc .game:eq(1)', [teams.nfc[5], teams.nfc[2]]);
    set_teams('#nfc_wc .game:eq(2)', [teams.nfc[4], teams.nfc[3]]);

    afc_div_teams = sort_teams([
        teams.afc[0],
        $('#afc_wc .game:eq(0) .selected').data('team'),
        $('#afc_wc .game:eq(1) .selected').data('team'),
        $('#afc_wc .game:eq(2) .selected').data('team')
    ], teams.afc);

    set_teams('#afc_div .game:eq(0)', [
        afc_div_teams[3],
        afc_div_teams[0]
    ]);
    set_teams('#afc_div .game:eq(1)', [
        afc_div_teams[2],
        afc_div_teams[1]
    ]);

    nfc_div_teams = sort_teams([
        teams.nfc[0],
        $('#nfc_wc .game:eq(0) .selected').data('team'),
        $('#nfc_wc .game:eq(1) .selected').data('team'),
        $('#nfc_wc .game:eq(2) .selected').data('team')
    ], teams.nfc);

    set_teams('#nfc_div .game:eq(0)', [
        nfc_div_teams[3],
        nfc_div_teams[0]
    ]);
    set_teams('#nfc_div .game:eq(1)', [
        nfc_div_teams[2],
        nfc_div_teams[1]
    ]);

    afc_conf_teams = sort_teams([
        $('#afc_div .game:eq(0) .selected').data('team'),
        $('#afc_div .game:eq(1) .selected').data('team')
    ], teams.afc);

    set_teams('#afc_conf .game', afc_conf_teams.reverse());

    nfc_conf_teams = sort_teams([
        $('#nfc_div .game:eq(0) .selected').data('team'),
        $('#nfc_div .game:eq(1) .selected').data('team')
    ], teams.nfc);

    set_teams('#nfc_conf .game', nfc_conf_teams.reverse());

    superbowl_teams = [
        $('#afc_conf .game .selected').data('team'),
        $('#nfc_conf .game .selected').data('team')
    ];

    set_teams('#sb_game .game', superbowl_teams);

    $('.champ .team').data('team',
        $('#sb_game .game .selected').data('team') || ''
    )

    $('.team').each(function(n, team) {
        var team_name = $(team).data('team');
        // image_url = '/media/img/nfl/' + team_name + '.gif'
        $(team).find('.team_logo').addClass(team_name);

        var seed = teams.afc.indexOf(team_name) + 1;
        if (seed == 0) {
            seed = teams.nfc.indexOf(team_name) + 1
        }

        if (seed == 0) {
            $(team).find('.seed').hide()
        }
        else {
            $(team).find('.seed').show().text(seed || '');
        }
//        $(team).find('.team_logo').append($('<img/>').attr('src', image_url).addClass('team_logo'));
    });

}

function init_games() {
    $('div.game').each(function() {
        $(this).append(make_game());
    });
}
function init_selectables() {
    $('.team-clickable').mousedown(function() {
        $(this).removeClass('selected').addClass('selecting');
    }).click(function(event) {
        $(this).removeClass('selecting').siblings().removeClass('selected selecting');
        $(this).addClass('selected');
        refresh_bracket(true);
    });
}

$(function() {
    init_games();
    init_selectables();
    select_teams(serial);
    if(serial == 0 && !window.location.toString().match(/\/0\/$/)) {
        set_url();
    }
    set_share_url();

    $('#share_url').click(function() {
        $('#share_url').focus().select();
    });
    $('#reset').click(function() {
        select_teams(0);
        set_url();
    });
});
