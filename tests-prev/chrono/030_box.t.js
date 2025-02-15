import { MinimalMutableBox } from "../../src/chrono/MutableBox.js";
StartTest(t => {
    t.it('Can create empty Box', t => {
        const node = MinimalMutableBox.new();
        t.is(node.hasValue(), false, 'No value initially provided');
        t.is(node.get(), undefined, 'No value initially provided');
        t.is(node.getPrevious(), undefined, 'Can track the old value');
    });
    t.it('Can create filled Box', t => {
        const node = MinimalMutableBox.new({ value$: 1 });
        t.is(node.hasValue(), true, 'Can set value');
        t.is(node.get(), 1, 'Can set value');
        t.is(node.getPrevious(), undefined, 'Can track the old value');
    });
    t.it('Can advance the Box forward in time, tracking the past', t => {
        const node = MinimalMutableBox.new();
        const node1 = node.set(1);
        t.is(node, node1, 'Box mutates in place');
        t.is(node.hasValue(), true, 'Can set value');
        t.is(node.get(), 1, 'Can set value');
        t.is(node.getPrevious(), undefined, 'Can track the old value');
        const node2 = node.set(2);
        t.is(node, node2, 'Box mutates in place');
        t.is(node.get(), 2, 'Can update value');
        t.is(node.getPrevious().get(), 1, 'Can track the old value');
        const node3 = node.set(3);
        t.is(node, node3, 'Box mutates in place');
        t.is(node.get(), 3, 'Can update value');
        t.is(node.getPrevious().get(), 2, 'Can track the old value');
        t.is(node.getPrevious().getPrevious().get(), 1, 'Can track the old value');
        t.is(node.getPrevious().getPrevious().getPrevious(), undefined, 'Can track the old value');
    });
});
