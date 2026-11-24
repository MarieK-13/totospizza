package com.totospizza.rules.policy;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.function.Predicate;

import com.totospizza.model.embeddable.RangoHorario;
import com.totospizza.model.entity.sucursal.HorarioSucursal;
import com.totospizza.model.entity.sucursal.Sucursal;

/**
 * Decide si una sucursal atiende en un momento dado.
 **/

public final class HorarioPolicy {

    private HorarioPolicy() {
    }

    public static boolean abierta(Sucursal sucursal, LocalDateTime ahora) {
        LocalTime hora = ahora.toLocalTime();
        return existe(sucursal, ahora.getDayOfWeek(), h -> turnoDeHoy(h, hora))
                || existe(sucursal, ahora.getDayOfWeek().minus(1), h -> madrugadaDeAyer(h, hora));
    }

    /** Hay al menos un día abierto con hora de apertura y de cierre. */
    public static boolean tieneHorarioUtil(Sucursal sucursal) {
        return sucursal.getHorarios().stream().anyMatch(h -> rango(h) != null);
    }

    private static boolean existe(Sucursal sucursal, DayOfWeek dia, Predicate<HorarioSucursal> condicion) {
        return sucursal.getHorarios().stream()
                .filter(h -> h.getDiaSemana() == dia)
                .anyMatch(condicion);
    }

    /** Desde la apertura hasta el cierre, o hasta la medianoche si el horario la cruza. */
    private static boolean turnoDeHoy(HorarioSucursal horario, LocalTime hora) {
        RangoHorario rango = rango(horario);
        if (rango == null) {
            return false;
        }
        return cruzaMedianoche(rango)
                ? !hora.isBefore(rango.getHoraInicio())
                : !hora.isBefore(rango.getHoraInicio()) && hora.isBefore(rango.getHoraFin());
    }

    /** La parte posterior a la medianoche de un horario que empezó el día anterior. */
    private static boolean madrugadaDeAyer(HorarioSucursal horario, LocalTime hora) {
        RangoHorario rango = rango(horario);
        return rango != null && cruzaMedianoche(rango) && hora.isBefore(rango.getHoraFin());
    }

    private static RangoHorario rango(HorarioSucursal horario) {
        RangoHorario rango = horario.getHorario();
        boolean utilizable = !horario.isCerrado() && rango != null
                && rango.getHoraInicio() != null && rango.getHoraFin() != null;
        return utilizable ? rango : null;
    }

    private static boolean cruzaMedianoche(RangoHorario rango) {
        return !rango.getHoraFin().isAfter(rango.getHoraInicio());
    }
}
