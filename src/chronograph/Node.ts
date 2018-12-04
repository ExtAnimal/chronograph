import {Calculable, Atom, ChronoValue, Readable, Writable, Immutable, MinimalRWAtom} from "../chrono/Atom.js";
import {chronoId, ChronoId} from "../chrono/ChronoId.js";
import {MutationData, PureCalculation} from "../chrono/Mutation.js";
import {Base, Constructable, Mixin, MixinConstructor} from "../class/Mixin.js";
import {Graph} from "../graph/Graph.js";
import {Node, ObservedBy, Observer} from "../graph/Node.js";


//---------------------------------------------------------------------------------------------------------------------
export const HasId = <T extends Constructable<Atom>>(base: T) =>

class HasId extends base {
    id          : ChronoId = chronoId()
}

export type HasId = Mixin<typeof HasId>



//---------------------------------------------------------------------------------------------------------------------
export const Reference = <T extends Constructable<Writable & Atom>>(base: T) =>

class Reference extends base {
    value       : Atom & Readable
}

export type Reference = Mixin<typeof Reference>


//---------------------------------------------------------------------------------------------------------------------
export type VersionedNodeConstructor    = MixinConstructor<typeof VersionedNode>

export const VersionedNode = <T extends Constructable<Node & Readable & Writable & Immutable & HasId>>(base: T) => {

    abstract class VersionedNode extends base {
        version         : ChronoId = chronoId()

        // immutable
        // can not add edge from `previous`
        previous        : Node & Atom & Readable


        // set (value : ChronoValue) : this {
        //     if (this.hasValue()) {
        //         return this.bump(value)
        //     } else {
        //         return super.set(value)
        //     }
        // }


        abstract getNextVersion () : ChronoId


        bump (value: ChronoValue) : this {
            const cls       = <VersionedNodeConstructor>(this.constructor as any)

            return cls.new({
                id              : this.id,
                version         : this.getNextVersion(),
                previous        : this,
                value           : value,
                get             : MinimalRWAtom.prototype.get
            }) as this
        }
    }

    return VersionedNode
}
export type VersionedNode = Mixin<typeof VersionedNode>


//---------------------------------------------------------------------------------------------------------------------
export const VersionedReference = <T extends Constructable<Reference & HasId>>(base: T) => {

    abstract class VersionedReference extends base {

        cls         : VersionedNodeConstructor

        // mutable
        previous    : VersionedNode
        // mutable
        value       : VersionedNode


        get () {
            return this.value ? MinimalRWAtom.prototype.get.call(this.value) : undefined
        }


        set (value : ChronoValue) : this {
            if (this.hasValue()) {
                const referencedNode        = this.value

                const nextNode              = referencedNode.bump(value)

                this.previous               = referencedNode

                return MinimalRWAtom.prototype.set.call(this, nextNode)
            } else {
                return MinimalRWAtom.prototype.set.call(this, this.bumpEmpty(value))
            }
        }


        bumpEmpty (value: ChronoValue) : VersionedNode {
            const cls       = <VersionedNodeConstructor>(this.cls || this.constructor as any)

            return cls.new({
                id              : this.id,
                previous        : null,
                value           : value,
                get             : MinimalRWAtom.prototype.get
            })
        }

    }

    return VersionedReference
}

export type VersionedReference = Mixin<typeof VersionedReference>



export const ChronoGraphNode = <T extends Constructable<Graph & HasId & VersionedNode & Readable>>(base: T) => {

    abstract class ChronoGraphNode extends base {
        cls         : ChronoGraphNode

        graph       : ChronoGraphNode


        getNextVersion () : ChronoId {
            return this.graph ? this.graph.version : chronoId()
        }


        joinGraph(graph : this['graph']) {
            if (this.graph) {
                this.unjoinGraph()
            }

            this.graph = graph
        }


        unjoinGraph() {
            delete this.graph
        }
    }

    return ChronoGraphNode
}

export type ChronoGraphNode = Mixin<typeof ChronoGraphNode>


export class MinimalChronoGraphNode extends ChronoGraphNode(
    Graph(Node(VersionedReference(Reference(VersionedNode(HasId(Node(Observer(ObservedBy(Readable(Writable(Atom(Base))))))))))))
) {
}




//---------------------------------------------------------------------------------------------------------------------
export type ComparatorFn<T> = (a : T, b : T) => number


//---------------------------------------------------------------------------------------------------------------------
export const Observable = <T extends Constructable<Atom & Readable & Writable & ObservedBy>>(base : T) => {

    abstract class Observable extends base {

        comparator        : ComparatorFn<ChronoValue>


        set (value : ChronoValue) {

            if (this.comparator(this.value, value) !== 0) {
                super.set(value)

                // push changes to observers

                // return this.runCalculation()
            }

            return this
        }
    }

    return Observable
}

export type Observable = Mixin<typeof Observable>


export const MinimalObservable = Observable(ObservedBy(Writable(Readable(Atom(Base)))))

export const UserInput = new MinimalObservable()


// //---------------------------------------------------------------------------------------------------------------------
// export const TraceableRead = <T extends Constructable<ChronoAtom & Readable>>(base : T) => {
//
//     abstract class TraceableRead extends base {
//         get ()              : ChronoValue {
//             this.traceRead()
//
//             return super.get()
//         }
//
//         abstract traceRead ()
//     }
//
//     return TraceableRead
// }
//
// export type TraceableRead = Mixin<typeof TraceableRead>




export const ChronoMutationNode = <T extends Constructable<MinimalChronoGraphNode & MutationData & PureCalculation>>(base: T) => {

    abstract class ChronoMutationNode extends base {

        getFromEdges(): Set<this> {
            const res = []

            this.mapInput(x => res.push(x))

            return new Set<this>([...res])
        }

        getToEdges(): Set<this> {
            return new Set<this>([...<any>(this.as)])
        }
    }

    return ChronoMutationNode
}
export type ChronoMutationNode = Mixin<typeof ChronoMutationNode>


export const GenericChronoMutationNode  = MutationData(Calculable(MinimalChronoGraphNode))




//---------------------------------------------------------------------------------------------------------------------
export const GraphNode2 = <T extends Constructable<Base>>(base: T) => {

    class GraphNode2 extends base {
        values          : (Atom & Readable)[]

        get () {
            return this.values[ this.values.length - 1 ].get()
        }

        set () {
            return this.values[ this.values.length - 1 ].get()
        }

    }

    return GraphNode2
}
export type GraphNode2 = Mixin<typeof GraphNode2>
